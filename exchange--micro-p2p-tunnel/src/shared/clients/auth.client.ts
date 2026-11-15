import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Cliente HTTP para micro-auth.
 *
 * Usado para validar JWT tokens de usuarios en la conexión WebSocket.
 */
@Injectable()
export class AuthClient {
  private readonly logger = new Logger(AuthClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:7000/api/v1';
  }

  /**
   * Valida un access token con micro-auth y retorna el userId.
   * Retorna null si el token es inválido.
   */
  async validateToken(token: string): Promise<{ userId: string; email?: string } | null> {
    try {
      this.logger.debug(`Validating token against ${this.baseUrl}/auth/me/profile`);
      const res = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/auth/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }),
      );

      const data = res.data;
      this.logger.debug(`Auth response: ${JSON.stringify(data)}`);
      if (data?.userId || data?._id || data?.id) {
        return {
          userId: data.userId || data._id || data.id,
          email: data.email,
        };
      }
      this.logger.warn('Auth response missing userId/_id/id');
      return null;
    } catch (err: any) {
      this.logger.error(`Auth validation failed: ${err.response?.status} ${err.message}`);
      return null;
    }
  }
}
