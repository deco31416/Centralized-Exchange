import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import * as crypto from 'crypto';

export interface OTPData {
    userId: string;
    purpose: 'login' | 'register' | 'reset' | 'change';
    attempts: number;
    expiresAt: number;
}

@Injectable()
export class OtpService {
    private readonly OTP_LENGTH: number;
    private readonly OTP_TTL_SECONDS: number;
    private readonly OTP_MAX_ATTEMPTS: number;
    private readonly OTP_RESEND_COOLDOWN: number;

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {
        this.OTP_LENGTH = this.configService.get<number>('OTP_LENGTH', 6);
        this.OTP_TTL_SECONDS = this.configService.get<number>('OTP_TTL_SECONDS', 600);
        this.OTP_MAX_ATTEMPTS = this.configService.get<number>('OTP_MAX_ATTEMPTS', 3);
        this.OTP_RESEND_COOLDOWN = this.configService.get<number>('OTP_RESEND_COOLDOWN', 60);
    }

    getOtpTtlSeconds(): number {
        return this.OTP_TTL_SECONDS;
    }

    /**
     * Generate a 6-digit OTP code
     * SECURITY: Stores HASH in Redis, never the plain code
     */
    async generateOTP(
        userId: string,
        purpose: 'login' | 'register' | 'reset' | 'change',
    ): Promise<string> {
        // Check resend cooldown
        const cooldownKey = `otp:cooldown:${userId}:${purpose}`;
        const cooldownExists = await this.redisService.get(cooldownKey);

        if (cooldownExists) {
            throw new BadRequestException({
                code: 'OTP_RESEND_COOLDOWN',
                message: `Please wait ${this.OTP_RESEND_COOLDOWN} seconds before requesting a new OTP`,
            });
        }

        // Generate random 6-digit code
        const otpCode = this.generateRandomCode(this.OTP_LENGTH);

        // Hash the OTP before storing (never store plain text)
        const otpHash = this.hashOTP(otpCode);

        // Store OTP data in Redis with TTL
        const otpKey = `otp:${userId}:${purpose}`;
        const otpData: OTPData = {
            userId,
            purpose,
            attempts: 0,
            expiresAt: Date.now() + this.OTP_TTL_SECONDS * 1000,
        };

        await this.redisService.set(
            otpKey,
            JSON.stringify({ ...otpData, hash: otpHash }),
            this.OTP_TTL_SECONDS,
        );

        // Set resend cooldown
        await this.redisService.set(cooldownKey, '1', this.OTP_RESEND_COOLDOWN);

        // SECURITY RULE: Return plain code ONLY to caller, never log it
        return otpCode;
    }

    /**
     * Verify OTP code
     * Consumes the OTP on successful verification
     */
    async verifyOTP(
        userId: string,
        code: string,
        purpose: 'login' | 'register' | 'reset' | 'change',
    ): Promise<boolean> {
        const otpKey = `otp:${userId}:${purpose}`;
        const storedDataStr = await this.redisService.get(otpKey);

        if (!storedDataStr) {
            throw new UnauthorizedException({
                code: 'OTP_NOT_FOUND',
                message: 'OTP not found or expired',
            });
        }

        const storedData = JSON.parse(storedDataStr);
        const { hash: storedHash, attempts, expiresAt } = storedData;

        // Check expiration
        if (Date.now() > expiresAt) {
            await this.redisService.del(otpKey);
            throw new UnauthorizedException({
                code: 'OTP_EXPIRED',
                message: 'OTP has expired',
            });
        }

        // Check max attempts
        if (attempts >= this.OTP_MAX_ATTEMPTS) {
            await this.redisService.del(otpKey);
            throw new UnauthorizedException({
                code: 'OTP_MAX_ATTEMPTS',
                message: 'Maximum OTP attempts exceeded',
            });
        }

        // Verify hash
        const codeHash = this.hashOTP(code);
        const isValid = codeHash === storedHash;

        if (!isValid) {
            // Increment attempts
            storedData.attempts += 1;
            const ttl = Math.floor((expiresAt - Date.now()) / 1000);
            await this.redisService.set(otpKey, JSON.stringify(storedData), ttl);

            throw new UnauthorizedException({
                code: 'INVALID_OTP',
                message: `Invalid OTP. ${this.OTP_MAX_ATTEMPTS - storedData.attempts} attempts remaining`,
            });
        }

        // SUCCESS: Consume OTP (delete from Redis)
        await this.redisService.del(otpKey);

        return true;
    }

    /**
     * Check if OTP is required for login based on adaptive policy
     */
    async isOTPRequiredForLogin(
        userId: string,
        ipAddress: string,
        userAgent: string,
    ): Promise<boolean> {
        // Feature flag override — parse string 'true'/'false' explicitly (env vars are always strings)
        const loginOtpEnabled = this.configService.get<string>('LOGIN_OTP_ENABLED', 'false') === 'true';
        if (!loginOtpEnabled) {
            return false; // Feature flag disabled — skip all OTP checks
        }

        // Check if IP is new for this user
        // (This would integrate with session telemetry service in real implementation)
        const knownIpKey = `user:${userId}:known_ips`;
        const ipHash = this.hashIP(ipAddress);
        const isKnownIP = await this.redisService.sismember(knownIpKey, ipHash);

        if (!isKnownIP) {
            // New IP detected
            return true;
        }

        // Check if device is new
        // (This would integrate with device fingerprinting in real implementation)
        const deviceKey = `user:${userId}:known_devices`;
        const deviceHash = this.hashUserAgent(userAgent);
        const isKnownDevice = await this.redisService.sismember(deviceKey, deviceHash);

        if (!isKnownDevice) {
            // New device detected
            return true;
        }

        // TODO Phase 2: Add risk score evaluation

        return false;
    }

    /**
     * Mark IP and device as known for user (called after successful login)
     */
    async markAsKnown(userId: string, ipAddress: string, userAgent: string): Promise<void> {
        const knownIpKey = `user:${userId}:known_ips`;
        const deviceKey = `user:${userId}:known_devices`;

        const ipHash = this.hashIP(ipAddress);
        const deviceHash = this.hashUserAgent(userAgent);

        await this.redisService.sadd(knownIpKey, ipHash);
        await this.redisService.sadd(deviceKey, deviceHash);

        // Set expiry on sets (e.g., 90 days)
        await this.redisService.expire(knownIpKey, 90 * 24 * 60 * 60);
        await this.redisService.expire(deviceKey, 90 * 24 * 60 * 60);
    }

    /**
     * Hash OTP code using SHA-256
     * SECURITY: Never store plain OTP
     */
    private hashOTP(code: string): string {
        return crypto
            .createHash('sha256')
            .update(code + this.configService.get<string>('ARGON2_PEPPER', ''))
            .digest('hex');
    }

    /**
     * Hash IP address for storage
     */
    private hashIP(ip: string): string {
        return crypto
            .createHash('sha256')
            .update(ip + this.configService.get<string>('ARGON2_PEPPER', ''))
            .digest('hex');
    }

    /**
     * Hash User-Agent for device tracking
     */
    private hashUserAgent(ua: string): string {
        return crypto
            .createHash('sha256')
            .update(ua + this.configService.get<string>('ARGON2_PEPPER', ''))
            .digest('hex');
    }

    /**
     * Generate cryptographically secure random numeric code
     */
    private generateRandomCode(length: number): string {
        const digits = '0123456789';
        let code = '';
        const randomBytes = crypto.randomBytes(length);

        for (let i = 0; i < length; i++) {
            code += digits[randomBytes[i] % digits.length];
        }

        return code;
    }
}
