import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Reads user identity from headers injected by the API Gateway.
 * Headers: x-user-id, x-user-email
 * NEVER trust userId from request body — always from gateway-injected headers.
 */
@Injectable()
export class UserContextGuard implements CanActivate {
  private readonly logger = new Logger(UserContextGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'] as string;
    const userEmail = request.headers['x-user-email'] as string;

    if (!userId) {
      this.logger.warn(`[UserContext] Missing x-user-id header | path=${request.path}`);
      throw new UnauthorizedException('x-user-id header required — inject via API Gateway');
    }

    request.userId = userId;
    request.userEmail = userEmail || null;

    return true;
  }
}
