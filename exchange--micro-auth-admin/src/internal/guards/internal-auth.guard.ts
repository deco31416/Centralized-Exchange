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
    const req = context.switchToHttp().getRequest<Request & any>();

    const configuredToken =
      this.configService.get<string>('INTERNAL_AUTH_TOKEN') ||
      process.env.INTERNAL_AUTH_TOKEN;

    if (!configuredToken) {
      throw new UnauthorizedException('Internal auth token not configured');
    }

    const headerToken =
      (req.headers?.['x-internal-auth-token'] as string | undefined) ||
      (req.headers?.['x-internal-token'] as string | undefined);

    const authHeader = req.headers?.['authorization'] as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;

    const provided = headerToken || bearerToken;

    if (!provided || provided !== configuredToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
