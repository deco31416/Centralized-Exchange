import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  private readonly logger = new Logger(InternalAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const expected = this.configService.get<string>('internalAuthToken');

    if (!expected) {
      this.logger.error('❌ INTERNAL_AUTH_TOKEN no configurado — rechazando acceso');
      throw new UnauthorizedException('INTERNAL_AUTH_TOKEN not configured');
    }

    const token =
      request.headers['x-internal-auth'] ||
      request.headers['x-internal-token'];

    if (!token || token !== expected) {
      this.logger.warn(`[InternalAuth] Token inválido | path=${request.path} | method=${request.method}`);
      throw new UnauthorizedException('Invalid internal auth token');
    }

    return true;
  }
}
