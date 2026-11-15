import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt, timingSafeEqual } from 'crypto';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './security.constants';

type OtpAction = 'P2P' | 'WITHDRAWAL' | 'INTERNAL_PAYMENT';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly bypassCode = process.env.OTP_BYPASS_CODE;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  requireOtpFor(action: OtpAction): boolean {
    if (action === 'P2P') return (process.env.OTP_REQUIRED_FOR_P2P ?? 'true') === 'true';
    if (action === 'WITHDRAWAL') return (process.env.OTP_REQUIRED_FOR_WITHDRAWALS ?? 'true') === 'true';
    return (process.env.OTP_REQUIRED_FOR_INTERNAL_PAYMENTS ?? 'true') === 'true';
  }

  async generateForUser(action: OtpAction, userId: string): Promise<{ code: string; expiresInSeconds: number }> {
    const expiresInSeconds = this.getOtpTtlSeconds();
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

    const key = this.getOtpKey(action, userId);
    await this.redis.set(key, code, 'EX', expiresInSeconds);

    this.logger.debug('OTP generated', { action, userId, expiresInSeconds });
    return { code, expiresInSeconds };
  }

  async verifyForUser(action: OtpAction, userId: string, otp: string | undefined): Promise<boolean> {
    if (!otp) return false;
    if (this.isBypass(otp)) return true;

    const key = this.getOtpKey(action, userId);
    const expected = await this.redis.get(key);
    if (!expected) return false;

    const ok = this.safeEquals(expected, otp);
    if (ok) {
      await this.redis.del(key);
      return true;
    }
    return false;
  }

  shouldReturnOtpInResponse(): boolean {
    const configured = this.configService.get<string>('OTP_RETURN_IN_RESPONSE');
    if (configured != null) return configured === 'true';
    return (process.env.NODE_ENV ?? 'development') !== 'production';
  }

  private getOtpKey(action: OtpAction, userId: string): string {
    return `otp:${action}:${userId}`;
  }

  private getOtpTtlSeconds(): number {
    const raw = this.configService.get<string>('OTP_TTL_SECONDS') ?? '300';
    const ttl = Number.parseInt(raw, 10);
    return Number.isFinite(ttl) && ttl > 0 ? ttl : 300;
  }

  private isBypass(otp: string): boolean {
    if (!this.bypassCode) return false;
    if (process.env.NODE_ENV === 'production') return false;
    return this.safeEquals(this.bypassCode, otp);
  }

  private safeEquals(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }
}
