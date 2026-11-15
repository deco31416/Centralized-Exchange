import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalAuthGuard implements CanActivate {
    private readonly logger = new Logger(InternalAuthGuard.name);

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const token = req.headers['x-internal-auth'] as string | undefined;
        const expected = process.env.INTERNAL_AUTH_TOKEN;

        if (!expected) {
            this.logger.error('[SECURITY] INTERNAL_AUTH_TOKEN no configurado — rutas expuestas sin autenticación');
            throw new UnauthorizedException('INTERNAL_AUTH_TOKEN not configured');
        }

        if (!token || token !== expected) {
            throw new UnauthorizedException('Invalid internal authentication token');
        }

        return true;
    }
}
