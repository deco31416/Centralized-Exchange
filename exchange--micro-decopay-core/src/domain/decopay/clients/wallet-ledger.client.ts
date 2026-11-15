import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WalletLedgerClient {
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

  private buildHeaders() {
    const internalToken =
      this.configService.get<string>('internalAuthToken') || '';

    return {
      'Content-Type': 'application/json',
      'x-internal-auth': internalToken,
    };
  }

  private minorToMajor(minorUnits: string, currency: string): number {
    const decimalsMap: Record<string, number> = {
      MXN: 2,
      USD: 2,
      COP: 2,
      PEN: 2,
      SVC: 2,
      BTC: 8,
      ETH: 8,
      USDT: 6,
      USDC: 6,
    };

    const decimals = decimalsMap[currency.toUpperCase()] ?? 2;
    const divisor = Math.pow(10, decimals);

    return Number(minorUnits) / divisor;
  }

  async getAvailableBalance(userId: string, currency: string) {
    const baseUrl =
      this.configService.get<string>('walletLedgerBaseUrl') || '';

    const url = this.joinUrl(baseUrl, `internal/wallets/user/${userId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.buildHeaders(),
          timeout: this.configService.get<number>('apiTimeout') || 30000,
          validateStatus: () => true,
        }),
      );

      if (response.status < 200 || response.status >= 300) {
        throw new ServiceUnavailableException({
          message: 'Error consultando balances en wallet-ledger-core',
          statusCode: response.status,
          data: response.data,
        });
      }

      const balances = Array.isArray(response.data?.balances)
        ? response.data.balances
        : [];

      const target = balances.find(
        (item: any) =>
          String(item?.currency || '').toUpperCase() === currency.toUpperCase(),
      );

      if (!target) {
        return {
          ok: true,
          userId,
          currency: currency.toUpperCase(),
          availableMinorUnits: '0',
          availableBalance: 0,
          raw: response.data,
        };
      }

      return {
        ok: true,
        userId,
        currency: String(target.currency).toUpperCase(),
        availableMinorUnits: String(target.availableMinorUnits || '0'),
        availableBalance: this.minorToMajor(
          String(target.availableMinorUnits || '0'),
          String(target.currency || currency),
        ),
        raw: response.data,
      };
    } catch (error: any) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException({
        message: 'No fue posible conectar con wallet-ledger-core',
        detail: error?.response?.data || error?.message || null,
      });
    }
  }

  async requestP2POtp(input: {
    userId: string;
    email?: string;
    correlationId?: string;
  }) {
    const baseUrl =
      this.configService.get<string>('walletLedgerBaseUrl') || '';

    const url = this.joinUrl(baseUrl, 'internal/transfers/p2p/request-otp');

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, input, {
          headers: this.buildHeaders(),
          timeout: this.configService.get<number>('apiTimeout') || 30000,
          validateStatus: () => true,
        }),
      );

      if (response.status < 200 || response.status >= 300) {
        throw new ServiceUnavailableException({
          message: 'Error solicitando OTP en wallet-ledger-core',
          statusCode: response.status,
          data: response.data,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException({
        message: 'No fue posible solicitar OTP a wallet-ledger-core',
        detail: error?.response?.data || error?.message || null,
      });
    }
  }

  async executeP2PTransfer(input: {
    fromUserId: string;
    toUserId: string;
    currency: string;
    amountMinorUnits: string;
    otp?: string;
    concept?: string;
    correlationId?: string;
  }) {
    const baseUrl =
      this.configService.get<string>('walletLedgerBaseUrl') || '';

    const url = this.joinUrl(baseUrl, 'internal/transfers/p2p');

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, input, {
          headers: this.buildHeaders(),
          timeout: this.configService.get<number>('apiTimeout') || 30000,
          validateStatus: () => true,
        }),
      );

      if (response.status < 200 || response.status >= 300) {
        throw new ServiceUnavailableException({
          message: 'Error ejecutando transferencia P2P en wallet-ledger-core',
          statusCode: response.status,
          data: response.data,
        });
      }

      if (response.data?.status === 'rejected') {
        throw new BadRequestException({
          message: 'La transferencia fue rechazada',
          reason: response.data?.reason || 'UNKNOWN',
          raw: response.data,
        });
      }

      return response.data;
    } catch (error: any) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException({
        message: 'No fue posible ejecutar la transferencia en wallet-ledger-core',
        detail: error?.response?.data || error?.message || null,
      });
    }
  }
}