import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';

/**
 * Rate limiting decorator
 */
export const RateLimit = (requests: number, windowMs: number) => {
  return Reflector.createDecorator<{ requests: number; windowMs: number }>()({
    requests,
    windowMs,
  });
};

/**
 * Rate limiting guard using Redis
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitConfig = this.reflector.get(RateLimit, context.getHandler());

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request, context);
    const windowSeconds = Math.floor(rateLimitConfig.windowMs / 1000);

    const current = await this.redisService.incrementCounter(
      key,
      windowSeconds,
    );

    if (current > rateLimitConfig.requests) {
      throw new HttpException(
        `Rate limit exceeded. Maximum ${rateLimitConfig.requests} requests per ${rateLimitConfig.windowMs}ms`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Generates rate limit key based on IP and endpoint
   */
  private generateKey(request: Request, context: ExecutionContext): string {
    const ip = this.extractIpAddress(request);
    const endpoint = `${request.method}:${request.route?.path || request.path}`;
    return `rate_limit:${ip}:${endpoint}`;
  }

  /**
   * Extracts IP address from request
   */
  private extractIpAddress(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
}
