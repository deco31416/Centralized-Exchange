import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Cliente HTTP para micro-signature-keys.
 *
 * Endpoints usados:
 *  - POST /signature/verify       → Verificar PIN
 *  - POST /dynamic-key/verify     → Verificar clave dinámica
 */
@Injectable()
export class SignatureKeysClient {
  private readonly logger = new Logger(SignatureKeysClient.name);
  private readonly baseUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      configService.get<string>('SIGNATURE_KEYS_URL') ||
      'http://localhost:3007/api/v1';
    this.internalToken =
      configService.get<string>('INTERNAL_AUTH_TOKEN') || '';
  }

  private headers(userId: string) {
    return {
      Authorization: `Bearer ${this.internalToken}`,
      'x-internal-auth': this.internalToken,
      'x-user-id': userId,
    };
  }

  /** Verifica el PIN del usuario. Retorna true si es válido. */
  async verifyPin(userId: string, pin: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.httpService.post<{ valid: boolean }>(
          `${this.baseUrl}/signature/verify`,
          { pin },
          { headers: this.headers(userId), timeout: 10000 },
        ),
      );
      return !!res.data?.valid;
    } catch (error: any) {
      this.logger.warn(
        `PIN verify failed for ${userId}: ${error?.response?.data?.message || error?.message}`,
      );
      return false;
    }
  }

  /** Verifica la clave dinámica (TOTP-like) del usuario. */
  async verifyDynamicKey(userId: string, code: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.httpService.post<{ valid: boolean }>(
          `${this.baseUrl}/dynamic-key/verify`,
          { code },
          { headers: this.headers(userId), timeout: 10000 },
        ),
      );
      return !!res.data?.valid;
    } catch (error: any) {
      this.logger.warn(
        `Dynamic key verify failed for ${userId}: ${error?.response?.data?.message || error?.message}`,
      );
      return false;
    }
  }
}
