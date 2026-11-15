import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      header(name: string): string | undefined;
    }>();
    const expectedToken =
      this.configService.get<string>('INTERNAL_AUTH_TOKEN') ||
      process.env.INTERNAL_AUTH_TOKEN;

    if (!expectedToken) {
      throw new UnauthorizedException('Internal auth token not configured');
    }

    const headerToken =
      request.header('x-internal-auth') ||
      request.header('x-internal-auth-token') ||
      request.header('x-internal-token');
    const authorizationHeader = request.header('authorization');
    const bearerToken = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.slice('Bearer '.length).trim()
      : undefined;
    const providedToken = headerToken || bearerToken;

    if (!providedToken || providedToken !== expectedToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
