import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService, REDIS_CLIENT } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const redisUrl =
          configService.get<string>('REDIS_URI') ||
          configService.get<string>('REDIS_URL');

        // FAIL FAST: Railway requires REDIS_URL to be set
        if (!redisUrl) {
          throw new Error(
            'REDIS_URI/REDIS_URL environment variable is required. ' +
            'This must be provided by Railway (REDIS_URL) or set in your .env file (REDIS_URI). ' +
            'Format: redis://default:password@host:port',
          );
        }

        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: false, // Connect immediately to validate URL
          retryStrategy: (times: number) => {
            if (times > 3) {
              console.error('Redis connection failed after 3 retries');
              return null; // Stop retrying
            }
            return Math.min(times * 100, 3000); // Exponential backoff
          },
        });

        // Log connection status (no sensitive data)
        redis.on('connect', () => {
          console.log('[Redis] Connected successfully');
        });

        redis.on('error', (err) => {
          console.error('[Redis] Connection error:', err.message);
        });

        return redis;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }
