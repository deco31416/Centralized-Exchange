import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RedisService } from '../../redis/redis.service';

type SmsOtpPurpose = 'dashboard' | 'reset';

interface StoredSmsOtpData {
  userId: string;
  purpose: SmsOtpPurpose;
  attempts: number;
  expiresAt: number;
  hash: string;
}

@Injectable()
export class SmsOtpService {
  private readonly OTP_LENGTH: number;
  private readonly OTP_TTL_SECONDS: number;
  private readonly OTP_MAX_ATTEMPTS: number;
  private readonly OTP_RESEND_COOLDOWN: number;
  private readonly VERIFIED_TTL_SECONDS: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.OTP_LENGTH = this.configService.get<number>('SMS_OTP_LENGTH', 6);
    this.OTP_TTL_SECONDS = this.configService.get<number>('SMS_OTP_TTL_SECONDS', 300);
    this.OTP_MAX_ATTEMPTS = this.configService.get<number>('SMS_OTP_MAX_ATTEMPTS', 3);
    this.OTP_RESEND_COOLDOWN = this.configService.get<number>('SMS_OTP_RESEND_COOLDOWN', 60);
    this.VERIFIED_TTL_SECONDS = this.configService.get<number>(
      'SMS_OTP_VERIFIED_TTL_SECONDS',
      600,
    );
  }

  getOtpTtlSeconds(): number {
    return this.OTP_TTL_SECONDS;
  }

  getVerifiedTtlSeconds(): number {
    return this.VERIFIED_TTL_SECONDS;
  }

  async generateOtp(userId: string, purpose: SmsOtpPurpose = 'dashboard'): Promise<string> {
    const cooldownKey = `smsotp:cooldown:${userId}:${purpose}`;
    const cooldownExists = await this.redisService.get(cooldownKey);

    if (cooldownExists) {
      throw new BadRequestException({
        code: 'SMS_OTP_RESEND_COOLDOWN',
        message: `Please wait ${this.OTP_RESEND_COOLDOWN} seconds before requesting a new SMS code`,
      });
    }

    const otpCode = this.generateRandomCode(this.OTP_LENGTH);
    const otpHash = this.hashOtp(otpCode);

    const otpKey = `smsotp:${userId}:${purpose}`;
    const data: StoredSmsOtpData = {
      userId,
      purpose,
      attempts: 0,
      expiresAt: Date.now() + this.OTP_TTL_SECONDS * 1000,
      hash: otpHash,
    };

    await this.redisService.set(otpKey, JSON.stringify(data), this.OTP_TTL_SECONDS);
    await this.redisService.set(cooldownKey, '1', this.OTP_RESEND_COOLDOWN);

    return otpCode;
  }

  async verifyOtp(userId: string, code: string, purpose: SmsOtpPurpose = 'dashboard'): Promise<void> {
    const otpKey = `smsotp:${userId}:${purpose}`;
    const storedStr = await this.redisService.get(otpKey);

    if (!storedStr) {
      throw new UnauthorizedException({
        code: 'SMS_OTP_NOT_FOUND',
        message: 'SMS code not found or expired',
      });
    }

    const stored = JSON.parse(storedStr) as StoredSmsOtpData;

    if (Date.now() > stored.expiresAt) {
      await this.redisService.del(otpKey);
      throw new UnauthorizedException({
        code: 'SMS_OTP_EXPIRED',
        message: 'SMS code has expired',
      });
    }

    if (stored.attempts >= this.OTP_MAX_ATTEMPTS) {
      await this.redisService.del(otpKey);
      throw new UnauthorizedException({
        code: 'SMS_OTP_MAX_ATTEMPTS',
        message: 'Maximum SMS code attempts exceeded',
      });
    }

    const isValid = this.hashOtp(code) === stored.hash;

    if (!isValid) {
      stored.attempts += 1;
      const ttl = Math.max(1, Math.floor((stored.expiresAt - Date.now()) / 1000));
      await this.redisService.set(otpKey, JSON.stringify(stored), ttl);
      throw new UnauthorizedException({
        code: 'INVALID_SMS_OTP',
        message: `Invalid code. ${this.OTP_MAX_ATTEMPTS - stored.attempts} attempts remaining`,
      });
    }

    await this.redisService.del(otpKey);
    await this.redisService.set(this.getVerifiedKey(userId, purpose), '1', this.VERIFIED_TTL_SECONDS);
  }

  async isVerified(userId: string, purpose: SmsOtpPurpose = 'dashboard'): Promise<boolean> {
    const v = await this.redisService.get(this.getVerifiedKey(userId, purpose));
    return !!v;
  }

  private getVerifiedKey(userId: string, purpose: SmsOtpPurpose): string {
    return `smsotp:verified:${userId}:${purpose}`;
  }

  private hashOtp(code: string): string {
    return crypto
      .createHash('sha256')
      .update(code + this.configService.get<string>('ARGON2_PEPPER', ''))
      .digest('hex');
  }

  private generateRandomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += crypto.randomInt(0, 10).toString();
    }
    return code;
  }
}
