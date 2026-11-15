import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CryptoService } from '../../crypto/crypto.service';

/**
 * JWT authentication guard
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly cryptoService: CryptoService) {
    super();
  }

  /**
   * Validates JWT token from Authorization header
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const payload = this.cryptoService.verifyJwtToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // Attach user payload to request
    request.user = payload;
    return true;
  }

  /**
   * Extracts Bearer token from Authorization header
   */
  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
