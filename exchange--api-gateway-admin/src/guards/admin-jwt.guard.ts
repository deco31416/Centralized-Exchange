import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';

/**
 * Guard de autenticación para el admin stack.
 * Valida Bearer JWT firmado con HS256 usando JWT_SECRET.
 * Solo se usa en rutas de escritura del gateway-admin que no pasen por el proxy catch-all.
 */
@Injectable()
export class AdminJwtGuard implements CanActivate {
    private readonly logger = new Logger(AdminJwtGuard.name);

    constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token de admin requerido');
        }

        const token = authHeader.slice(7);
        const secret = this.configService.get<string>('config.jwt.secret');

        if (!secret) {
            this.logger.error('JWT_SECRET no configurado en gateway-admin');
            throw new UnauthorizedException('Configuración de auth incompleta');
        }

        const payload = this.verifyHs256Jwt(token, secret);

        if (!payload) {
            throw new UnauthorizedException('Token de admin inválido o expirado');
        }

        // Attach decoded payload to request for downstream use
        (request as any).adminUser = payload;
        return true;
    }

    /**
     * Verifies an HS256 JWT without external dependencies.
     * Returns decoded payload or null if invalid/expired.
     */
    private verifyHs256Jwt(token: string, secret: string): Record<string, unknown> | null {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [header, payload, signature] = parts;

        // Verify signature
        try {
            const expectedSig = crypto
                .createHmac('sha256', secret)
                .update(`${header}.${payload}`)
                .digest('base64url');

            if (!crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSig),
            )) {
                return null;
            }
        } catch {
            return null;
        }

        // Decode and validate payload
        try {
            const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;

            // Validate expiration
            if (typeof decoded.exp === 'number' && Date.now() / 1000 > decoded.exp) {
                return null;
            }

            return decoded;
        } catch {
            return null;
        }
    }
}
