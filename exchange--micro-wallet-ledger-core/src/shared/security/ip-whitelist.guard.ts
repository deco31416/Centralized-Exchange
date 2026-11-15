import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * IP Whitelist Guard - Restringe acceso solo a IPs autorizadas
 *
 * Variables de entorno:
 * - IP_WHITELIST_ENABLED: 'true' para habilitar (default: false en dev)
 * - IP_WHITELIST: Lista separada por comas de IPs permitidas
 *
 * Ejemplo .env:
 * IP_WHITELIST_ENABLED=true
 * IP_WHITELIST=10.0.0.1,10.0.0.2,172.16.0.0/12
 */
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const enabled =
      this.configService.get<string>('IP_WHITELIST_ENABLED') === 'true';

    // En dev, si no está habilitado, permitir todo
    if (!enabled) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const clientIp = this.getClientIp(req);

    const whitelistRaw = this.configService.get<string>('IP_WHITELIST') || '';
    const whitelist = whitelistRaw
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);

    if (whitelist.length === 0) {
      // Si está habilitado pero sin lista, bloquear todo por seguridad
      throw new ForbiddenException('IP whitelist enabled but not configured');
    }

    const allowed = whitelist.some((allowedIp) => {
      // Support for CIDR notation (basic)
      if (allowedIp.includes('/')) {
        // For production, use a proper CIDR library (e.g., ip-range-check)
        return false; // Placeholder: implement CIDR matching
      }
      return clientIp === allowedIp;
    });

    if (!allowed) {
      throw new ForbiddenException(`Access denied from IP: ${clientIp}`);
    }

    return true;
  }

  private getClientIp(req: any): string {
    // Check multiple headers (Railway/Cloudflare/Nginx proxies)
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }
}
