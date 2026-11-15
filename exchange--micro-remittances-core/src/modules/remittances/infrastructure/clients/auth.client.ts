import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  AuthClientPort,
  AuthUserSummary,
} from '../../domain/ports/auth-client.port';

@Injectable()
export class AuthClient implements AuthClientPort {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(userId: string): Promise<AuthUserSummary | null> {
    const baseUrl = this.configService.get<string>('services.auth');
    const token = this.configService.get<string>('internalAuthToken');
    const timeout = this.configService.get<number>('requestTimeoutMs');

    if (!baseUrl) {
      throw new BadGatewayException('AUTH_SERVICE_URL no está configurado');
    }

    // Endpoint real: GET /internal/users/:userId/profile (api/v1 ya está en AUTH_SERVICE_URL)
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${baseUrl}/internal/users/${encodeURIComponent(userId)}/profile`,
          {
            timeout,
            headers: {
              'x-internal-auth': token,
            },
          },
        ),
      );

      const user = response?.data?.data ?? response?.data;

      if (!user) {
        return null;
      }

      const firstName = user.firstName || user.first_name || '';
      const lastName = user.lastName || user.last_name || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.name || user.username;

      return {
        id: user.userId || user.id || user._id,
        name: fullName,
        email: user.email,
        phone: user.phone,
      };
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404 || status === 400) {
        return null;
      }

      throw new BadGatewayException(
        error?.response?.data?.message ||
          'Error consultando el micro de auth',
      );
    }
  }

  async searchRecipient(query: string): Promise<AuthUserSummary | null> {
    const baseUrl = this.configService.get<string>('services.auth');
    const path = this.configService.get<string>('paths.authSearchUser');
    const token = this.configService.get<string>('internalAuthToken');
    const timeout = this.configService.get<number>('requestTimeoutMs');

    if (!baseUrl) {
      throw new BadGatewayException('AUTH_SERVICE_URL no está configurado');
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${baseUrl}/internal/users/search`, {
          timeout,
          headers: {
            Authorization: `Bearer ${token}`,
            'x-internal-auth': token,
          },
          params: {
            q: query,
          },
        }),
      );

      const user =
        response?.data?.data?.[0] ??
        response?.data?.data ??
        response?.data?.user ??
        response?.data;

      if (!user) {
        return null;
      }

      return {
        id: user.id || user.userId || user._id,
        name: user.name || user.fullName || user.nombre,
        email: user.email,
        phone: user.phone || user.telefono,
      };
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404 || status === 400) {
        return null;
      }

      throw new BadGatewayException(
        error?.response?.data?.message ||
          'Error buscando destinatario en auth',
      );
    }
  }
}