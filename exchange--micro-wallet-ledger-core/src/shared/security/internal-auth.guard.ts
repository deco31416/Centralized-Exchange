import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-internal-auth'] as string | undefined;
    const expected = process.env.INTERNAL_AUTH_TOKEN;

    if (!expected) {
      throw new UnauthorizedException('INTERNAL_AUTH_TOKEN not configured');
    }

    if (!token || token !== expected) {
      throw new UnauthorizedException('Invalid internal auth token');
    }

    return true;
  }
}
