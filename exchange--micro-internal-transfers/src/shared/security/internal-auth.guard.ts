import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Guard para autenticación interna entre microservicios.
 * Valida header: Authorization: Bearer <INTERNAL_AUTH_TOKEN>
 */
@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const expectedToken =
      this.configService.get<string>('INTERNAL_AUTH_TOKEN');

    if (!expectedToken) {
      throw new UnauthorizedException('INTERNAL_AUTH_TOKEN not configured');
    }

    if (token !== expectedToken) {
      throw new UnauthorizedException('Invalid internal auth token');
    }

    return true;
  }
}
