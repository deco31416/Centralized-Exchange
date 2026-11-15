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
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-internal-auth'] as string | undefined;
    const expected = this.configService.get<string>('INTERNAL_AUTH_TOKEN');

    if (!expected) {
      throw new UnauthorizedException('INTERNAL_AUTH_TOKEN not configured');
    }

    if (!token || token !== expected) {
      throw new UnauthorizedException('Invalid internal auth token');
    }

    return true;
  }
}
