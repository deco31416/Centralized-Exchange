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
    const request = context.switchToHttp().getRequest();
    const internalAuth = request.headers['x-internal-auth'];
    const expectedToken = this.configService.get<string>('internalAuthToken');

    if (!expectedToken) {
      return true;
    }

    if (!internalAuth || internalAuth !== expectedToken) {
      throw new UnauthorizedException('Invalid internal auth token');
    }

    return true;
  }
}