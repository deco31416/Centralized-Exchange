import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const token = req.headers['x-internal-auth'] as string | undefined;
        const expected = process.env.INTERNAL_AUTH_TOKEN?.trim();

        if (!expected || expected === 'xxxxx--xxxxx') {
            throw new UnauthorizedException('Internal authentication is not configured');
        }

        if (!token || token !== expected) {
            throw new UnauthorizedException('Invalid internal authentication token');
        }

        return true;
    }
}
