import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SignatureKeysClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private joinUrl(baseUrl: string, path: string): string {
    const cleanBase = String(baseUrl || '').replace(/\/+$/, '');
    const cleanPath = String(path || '').replace(/^\/+/, '');

    if (/\/api\/v\d+$/i.test(cleanBase)) {
      return `${cleanBase}/${cleanPath}`;
    }

    const apiPrefix =
      this.configService.get<string>('apiPrefix') || 'api/v1';

    return `${cleanBase}/${apiPrefix}/${cleanPath}`;
  }

  async validatePin(userId: string, pin: string) {
    const baseUrl =
      this.configService.get<string>('signatureKeysBaseUrl') || '';
    const internalToken =
      this.configService.get<string>('internalAuthToken') || '';

    const url = this.joinUrl(baseUrl, 'signature/verify');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { pin },
          {
            headers: {
              Authorization: `Bearer ${internalToken}`,
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            timeout: this.configService.get<number>('apiTimeout') || 30000,
            validateStatus: () => true,
          },
        ),
      );

      if (response.status === 401 || response.status === 403) {
        throw new UnauthorizedException('PIN inválido o no autorizado');
      }

      if (response.status < 200 || response.status >= 300) {
        throw new ServiceUnavailableException({
          message: 'Error validando PIN en signature-keys',
          statusCode: response.status,
          data: response.data,
        });
      }

      const valid = Boolean(response.data?.valid);

      if (!valid) {
        throw new UnauthorizedException('PIN inválido');
      }

      return {
        ok: true,
        valid: true,
        raw: response.data,
      };
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException({
        message: 'No fue posible conectar con signature-keys',
        detail: error?.response?.data || error?.message || null,
      });
    }
  }
}