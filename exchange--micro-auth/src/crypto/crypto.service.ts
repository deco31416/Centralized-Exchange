import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { HashedToken, JwtPayload } from '../shared/types/common.types';

/**
 * Cryptography service for password hashing, JWT, and token generation
 */
@Injectable()
export class CryptoService {
  private readonly pepper: string;
  private readonly argon2Options: argon2.Options;
  private readonly mfaEncKey: Buffer;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.pepper = this.readRequiredSecret('ARGON2_PEPPER', 32);
    this.argon2Options = {
      type: argon2.argon2id,
      memoryCost: this.configService.get<number>('ARGON2_MEMORY_COST') || 65536,
      timeCost: this.configService.get<number>('ARGON2_TIME_COST') || 3,
      parallelism: this.configService.get<number>('ARGON2_PARALLELISM') || 1,
    };

    const rawMfaKey =
      this.configService.get<string>('MFA_TOTP_ENC_KEY') ||
      this.configService.get<string>('MFA_ENC_KEY') ||
      '';
    // Derive a stable 32-byte key from configured secret (or pepper fallback for dev)
    const keyMaterial = rawMfaKey || this.pepper;
    this.mfaEncKey = crypto.createHash('sha256').update(keyMaterial).digest();
  }

  encryptString(plainText: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.mfaEncKey, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  decryptString(encryptedText: string): string {
    const parts = String(encryptedText || '').split(':');
    if (parts.length !== 4 || parts[0] !== 'v1') {
      throw new Error('Invalid encrypted payload');
    }

    const iv = Buffer.from(parts[1], 'base64');
    const tag = Buffer.from(parts[2], 'base64');
    const encrypted = Buffer.from(parts[3], 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.mfaEncKey, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  /**
   * Hashes a password using Argon2id with pepper and salt
   */
  async hashPassword(password: string): Promise<HashedToken> {
    const salt = this.generateRandomString(32);
    const pepperedPassword = password + this.pepper + salt;
    const hash = await argon2.hash(pepperedPassword, {
      ...this.argon2Options,
      salt: Buffer.from(salt),
    });
    return { hash, salt };
  }

  /**
   * Verifies a password against its hash
   */
  async verifyPassword(
    password: string,
    hash: string,
    salt: string,
  ): Promise<boolean> {
    try {
      const pepperedPassword = password + this.pepper + salt;
      return await argon2.verify(hash, pepperedPassword);
    } catch {
      return false;
    }
  }

  /**
   * Generates a secure random string
   */
  generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generates a URL-safe random string of specified length
   */
  generateUrlSafeToken(length: number = 48): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Generates a secure random token
   */
  generateSecureToken(): string {
    return this.generateUrlSafeToken(48);
  }

  /**
   * Generates a numeric OTP
   */
  generateNumericOtp(length: number = 6): string {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits[crypto.randomInt(0, digits.length)];
    }
    return result;
  }

  /**
   * Hashes a token with salt for storage
   */
  hashToken(token: string): HashedToken {
    const salt = this.generateRandomString(16);
    const hash = crypto
      .createHash('sha256')
      .update(token + salt)
      .digest('hex');
    return { hash, salt };
  }

  /**
   * Verifies a token against its hash
   */
  verifyToken(token: string, hash: string, salt: string): boolean {
    const computedHash = crypto
      .createHash('sha256')
      .update(token + salt)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  }

  /**
   * Hashes data for anonymization (one-way)
   */
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + this.pepper)
      .digest('hex');
  }

  /**
   * Signs a JWT access token
   */
  signAccessToken(payload: Partial<JwtPayload>): string {
    const now = Math.floor(Date.now() / 1000);
    const accessTokenTtl =
      this.configService.get<number>('JWT_ACCESS_TOKEN_TTL') || 600;

    const fullPayload: JwtPayload = {
      sub: payload.sub || 'anonymous',
      aud: 'access',
      iat: now,
      nbf: now,
      exp: now + accessTokenTtl,
      jti: uuidv4(),
      scope: 'api',
      ...payload,
    };

    return this.jwtService.sign(fullPayload);
  }

  /**
   * Verifies and decodes a JWT token
   */
  verifyJwtToken(token: string): JwtPayload | null {
    try {
      const payload = this.jwtService.verify(token);
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generates a unique session ID
   */
  generateSessionId(): string {
    return 'sess_' + this.generateUrlSafeToken(32);
  }

  /**
   * Generates a device fingerprint hash
   */
  generateDeviceFingerprint(
    userAgent: string,
    additionalData?: string,
  ): string {
    const data = userAgent + (additionalData || '');
    return this.hashData(data);
  }

  /**
   * Constant-time string comparison
   */
  constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  private readRequiredSecret(key: string, minLength: number): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value || value.length < minLength) {
      throw new Error(`${key} must be configured with at least ${minLength} characters.`);
    }
    return value;
  }
}
