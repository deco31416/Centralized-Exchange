import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Internal Authentication Guard para comunicación segura entre microservicios
 * 
 * Validación:
 * - Header: x-internal-auth
 * - Valor debe coincidir con INTERNAL_AUTH_TOKEN en .env
 * 
 * Uso:
 * ```typescript
 * @UseGuards(InternalAuthGuard)
 * @Post('endpoint')
 * async myMethod() { ... }
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

    // En desarrollo, si no hay token configurado, permitir acceso
    if (!expected) {
      this.logger.warn('INTERNAL_AUTH_TOKEN no configurado - permitiendo acceso en desarrollo');
      return true;
    }

    if (!token) {
      this.logger.error('Header x-internal-auth faltante');
      throw new UnauthorizedException('Se requiere autenticación interna');
    }

    if (token !== expected) {
      this.logger.error('Token de autenticación inválido', {
        ip: request.ip,
        path: request.path,
        method: request.method,
      });
      throw new UnauthorizedException('Token de autenticación inválido');
    }

    // Log de acceso exitoso (sin exponer el token)
    this.logger.debug('Autenticación interna exitosa', {
      path: request.path,
      method: request.method,
      ip: request.ip,
    });

    return true;
  }
}
