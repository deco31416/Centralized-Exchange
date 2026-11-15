import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const expectedKey =
      this.configService.get<string>('security.internalAuthToken') ||
      this.configService.get<string>('security.internalApiKey') ||
      process.env.INTERNAL_AUTH_TOKEN ||
      process.env.INTERNAL_API_KEY;

    if (!expectedKey) {
      return true;
    }

    const internalHeader = request.header('x-internal-auth');
    const authorizationHeader = request.header('authorization');

    let providedKey = internalHeader;

    if (!providedKey && authorizationHeader?.startsWith('Bearer ')) {
      providedKey = authorizationHeader.replace('Bearer ', '').trim();
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal authentication key');
    }

    return true;
  }
}