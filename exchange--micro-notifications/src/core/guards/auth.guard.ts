import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    try {
      const authHeader = request.headers.authorization;
      const signatureHeader = request.headers['x-signature'] as string;
      const timestampHeader = request.headers['x-timestamp'] as string;

      if (authHeader) {
        return this.validateBearerToken(request, authHeader);
      }

      if (signatureHeader && timestampHeader) {
        return this.validateHmacSignature(request, signatureHeader, timestampHeader);
      }

      throw new UnauthorizedException('Missing authentication credentials');
    } catch (error) {
      this.logger.warn('Authentication failed', {
        path: request.url,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException('Invalid authentication');
    }
  }

  private validateBearerToken(request: Request, authHeader: string): boolean {
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';
    const serviceTokens: Record<string, string> = this.configService.get('auth.serviceTokens', {});
    
    const entry = Object.entries(serviceTokens).find(([, value]) =>
      this.safeCompare(token, value),
    );
    if (!entry) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    const [serviceName] = entry;
    (request as any).authenticatedService = serviceName;

    return true;
  }

  private validateHmacSignature(
    request: Request,
    signature: string,
    timestamp: string,
  ): boolean {
    const hmacKeys: Record<string, string> = this.configService.get('auth.hmacKeys', {});
    
    if (Object.keys(hmacKeys).length === 0) {
      throw new UnauthorizedException('HMAC authentication not configured');
    }

    const timestampNum = parseInt(timestamp, 10);
    const now = Date.now();
    const timeDiff = Math.abs(now - timestampNum);
    
    // Allow 5 minutes clock skew
    if (timeDiff > 5 * 60 * 1000) {
      throw new UnauthorizedException('Request timestamp too old');
    }

    const body = JSON.stringify(request.body);
    const payload = `${request.method}${request.path}${body}${timestamp}`;

    for (const [serviceName, secret] of Object.entries(hmacKeys)) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      if (this.safeCompareHex(signature, expectedSignature)) {
        // Add service name to request for logging
        (request as any).authenticatedService = serviceName;
        return true;
      }
    }

    throw new UnauthorizedException('Invalid HMAC signature');
  }

  private safeCompare(input: string, expected: string): boolean {
    const inputBuffer = Buffer.from(input);
    const expectedBuffer = Buffer.from(expected);
    if (inputBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
  }

  private safeCompareHex(input: string, expected: string): boolean {
    if (!/^[a-fA-F0-9]+$/.test(input)) return false;
    return this.safeCompare(input.toLowerCase(), expected.toLowerCase());
  }
}
