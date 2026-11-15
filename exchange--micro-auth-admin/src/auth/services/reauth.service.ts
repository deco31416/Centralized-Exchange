import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class ReauthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  getReauthTtlSeconds(): number {
    return this.configService.get<number>('SENSITIVE_REAUTH_TTL_SECONDS', 600);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.redisService.set(
      this.emailVerifiedKey(userId),
      '1',
      this.getReauthTtlSeconds(),
    );
  }

  async isEmailVerified(userId: string): Promise<boolean> {
    const v = await this.redisService.get(this.emailVerifiedKey(userId));
    return !!v;
  }

  private emailVerifiedKey(userId: string): string {
    return `reauth:email_verified:${userId}`;
  }
}
