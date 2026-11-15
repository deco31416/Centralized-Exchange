import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { OtpService } from './otp.service';
import { IpWhitelistGuard } from './ip-whitelist.guard';
import { REDIS_CLIENT } from './security.constants';

function sanitizeRedisUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    // Never leak creds (username/password) in logs.
    url.username = '';
    url.password = '';
    return url.toString();
  } catch {
    // If it isn't a valid URL, avoid echoing rawUrl (might contain creds).
    return '[invalid-redis-url]';
  }
}

function firstNonEmpty(...candidates: Array<unknown>): string {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  for (const candidate of candidates) {
    if (candidate == null) continue;
    try {
      const str = String(candidate);
      if (str.trim().length > 0) return str;
    } catch {
      // ignore
    }
  }
  return 'unknown';
}

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') ??
          configService.get<string>('REDIS_URI');
        if (!redisUrl) {
          throw new Error('REDIS_URL or REDIS_URI is required');
        }
        let lastLoggedAt = 0;

        const safeRedisUrl = sanitizeRedisUrl(redisUrl);

        const client = new Redis(redisUrl, {
          // Don't crash the process on connection errors; log and keep retrying.
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
          connectTimeout: 5_000,
          retryStrategy: (times) => {
            // Backoff up to 5s to reduce log spam when Redis isn't running.
            const delay = Math.min(5_000, 250 * times);
            return delay;
          },
        });

        client.on('connect', () => {
          // eslint-disable-next-line no-console
          console.log('[REDIS][OTP] connected:', safeRedisUrl);
        });

        client.on('ready', () => {
          // eslint-disable-next-line no-console
          console.log('[REDIS][OTP] ready');
        });

        client.on('error', (error) => {
          const now = Date.now();
          if (now - lastLoggedAt < 10_000) return;
          lastLoggedAt = now;

          const message = firstNonEmpty(
            (error as any)?.message,
            (error as any)?.code,
            (error as any)?.name,
            (error as any)?.stack,
          );

          // eslint-disable-next-line no-console
          console.error('[REDIS][OTP] connection error:', message, '|', safeRedisUrl);
        });

        return client;
      },
    },
    OtpService,
    IpWhitelistGuard,
  ],
  exports: [OtpService, IpWhitelistGuard],
})
export class SecurityModule {}
