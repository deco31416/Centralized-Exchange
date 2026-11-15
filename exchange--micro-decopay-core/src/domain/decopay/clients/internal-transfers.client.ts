import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InternalTransfersClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private joinUrl(baseUrl: string, path: string): string {
    const base = String(baseUrl || '').replace(/\/+$/, '');
    let nextPath = String(path || '');

    if (!nextPath.startsWith('/')) {
      nextPath = `/${nextPath}`;
    }

    const prefixMatch = base.match(/\/(api\/v\d+)$/i);
    if (prefixMatch) {
      const prefix = `/${prefixMatch[1]}`;
      if (nextPath.toLowerCase().startsWith(prefix.toLowerCase() + '/')) {
        nextPath = nextPath.slice(prefix.length);
      } else if (nextPath.toLowerCase() === prefix.toLowerCase()) {
        nextPath = '';
      }
    }

    return `${base}${nextPath}`;
  }

  private buildHeaders() {
    const internalToken =
      this.configService.get<string>('internalAuthToken') ||
      process.env.INTERNAL_AUTH_TOKEN ||
      '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (internalToken) {
      headers.Authorization = `Bearer ${internalToken}`;
      headers['X-Internal-Auth'] = internalToken;
    }

    return headers;
  }

  async executeDECOPAYTransfer(payload: Record<string, unknown>) {
    const baseUrl =
      this.configService.get<string>('internalTransfersBaseUrl') || '';

    const configuredPath = process.env.DECOPAY_INTERNAL_TRANSFER_PATH;
    const candidatePaths = [
      configuredPath,
      '/api/v1/internal/p2p/transfer',
      '/api/v1/internal/p2p/transfers',
      '/api/v1/internal/transfers',
      '/api/v1/transfers/internal',
    ].filter(Boolean) as string[];

    let lastError: any;

    for (const path of candidatePaths) {
      try {
        const url = this.joinUrl(baseUrl, path);

        const response = await firstValueFrom(
          this.httpService.post(url, payload, {
            headers: this.buildHeaders(),
            timeout:
              this.configService.get<number>('apiTimeout') || 30000,
            validateStatus: () => true,
          }),
        );

        if (response.status >= 200 && response.status < 300) {
          const data = response.data ?? {};
          return {
            ok: true,
            source: 'internal-transfers',
            endpoint: path,
            data,
            transactionId:
              data?.transactionId ||
              data?.data?.transactionId ||
              data?.id ||
              data?.data?.id ||
              crypto.randomUUID(),
            receiptId:
              data?.receiptId ||
              data?.data?.receiptId ||
              null,
          };
        }

        if (response.status === 404 || response.status === 405) {
          lastError = response.data;
          continue;
        }

        throw new BadRequestException(
          response.data?.message ||
            `internal-transfers respondió con estado ${response.status}`,
        );
      } catch (error: any) {
        lastError = error;
      }
    }

    throw new ServiceUnavailableException({
      message:
        'No fue posible ejecutar la transferencia en internal-transfers. Revisa la URL o el path configurado.',
      service: 'internal-transfers',
      baseUrl,
      suggestedEnv: 'DECOPAY_INTERNAL_TRANSFER_PATH',
      detail:
        lastError?.response?.data ||
        lastError?.message ||
        'Sin detalle adicional',
    });
  }
}