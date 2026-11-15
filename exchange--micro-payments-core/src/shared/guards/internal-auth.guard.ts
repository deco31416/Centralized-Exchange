import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard de autenticación interna para comunicación segura entre microservicios
 * 
 * UBICACIÓN ESTÁNDAR: src/shared/guards/internal-auth.guard.ts
 * 
 * Validación:
 * - Header: x-internal-auth
 * - Valor debe coincidir con INTERNAL_AUTH_TOKEN en .env
 * - Logs de auditoría para todas las tentativas
 * 
 * Uso:
 * ```typescript
 * import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
 * 
 * @Controller('internal/events')
 * @UseGuards(InternalAuthGuard)
 * export class MyController {
 *   // Todos los endpoints protegidos
 * }
 * ```
 * 
 * Cliente debe enviar:
 * ```typescript
 * headers: {
 *   'x-internal-auth': process.env.INTERNAL_AUTH_TOKEN
 * }
 * ```
 */
@Injectable()
export class InternalAuthGuard implements CanActivate {
  private readonly logger = new Logger(InternalAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-internal-auth'] as string | undefined;
    const expected = this.configService.get<string>('INTERNAL_AUTH_TOKEN');

    // En desarrollo, si no hay token configurado, permitir acceso con warning
    if (!expected) {
      this.logger.warn('⚠️  INTERNAL_AUTH_TOKEN no configurado - permitiendo acceso en desarrollo');
      return true;
    }

    // Validar presencia del token
    if (!token) {
      this.logger.error('❌ Header x-internal-auth faltante', {
        ip: request.ip,
        path: request.path,
        method: request.method,
        userAgent: request.headers['user-agent'],
      });
      throw new UnauthorizedException('Se requiere autenticación interna');
    }

    // Validar que el token coincida
    if (token !== expected) {
      this.logger.error('❌ Token de autenticación inválido', {
        ip: request.ip,
        path: request.path,
        method: request.method,
        tokenLength: token.length,
        expectedLength: expected.length,
      });
      throw new UnauthorizedException('Token de autenticación inválido');
    }

    // Log de acceso exitoso (sin exponer el token)
    this.logger.debug('✅ Autenticación interna exitosa', {
      path: request.path,
      method: request.method,
      ip: request.ip,
      correlationId: request.headers['x-correlation-id'],
      idempotencyKey: request.headers['x-idempotency-key'],
    });

    return true;
  }
}
