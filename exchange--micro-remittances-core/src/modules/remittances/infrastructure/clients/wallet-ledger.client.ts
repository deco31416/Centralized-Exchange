import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  CaptureReservationPayload,
  CaptureReservationResult,
  CreditBalancePayload,
  CreditBalanceResult,
  ReleaseReservationResult,
  ReserveBalancePayload,
  ReserveBalanceResult,
  WalletLedgerClientPort,
  WalletSummary,
} from '../../domain/ports/wallet-ledger-client.port';

@Injectable()
export class WalletLedgerClient implements WalletLedgerClientPort {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getSummary(userId: string): Promise<WalletSummary> {
    const baseUrl = this.configService.get<string>('services.walletLedger');
    const token = this.configService.get<string>('internalAuthToken');
    const timeout = this.configService.get<number>('requestTimeoutMs');

    if (!baseUrl) {
      throw new BadGatewayException(
        'WALLET_LEDGER_SERVICE_URL/WALLET_LEDGER_URL no está configurado',
      );
    }

    let rawResponse: any;
    try {
      const url = `${baseUrl}/internal/wallets/user/${encodeURIComponent(userId)}/summary`;
      const res = await lastValueFrom(
        this.httpService.get(url, {
          timeout,
          headers: {
            Authorization: `Bearer ${token}`,
            'x-internal-auth': token,
          },
        }),
      );
      rawResponse = res.data;
    } catch (error: any) {
      throw new BadGatewayException(
        error?.response?.data?.message || 'Error consultando wallet-ledger summary',
      );
    }

    const data = rawResponse?.data ?? rawResponse;

    return {
      walletId: data.walletId || data.id || data.wallet?.id,
      walletName: data.walletName || data.name || data.wallet?.name || 'Monedero Personal',
      currency: data.currency || data.wallet?.currency || 'DECOX',
      balance: Number(data.balance ?? data.availableBalance ?? 0),
      maskedNumber: data.maskedNumber || data.wallet?.maskedNumber,
    };
  }

  async reserveBalance(
    payload: ReserveBalancePayload,
  ): Promise<ReserveBalanceResult> {
    const response = await this.request('post', 'paths.walletReserve', payload);

    const data = response?.data ?? response;

    return {
      reservationId:
        data.reservationId || data.id || data.reference || `reserve_${Date.now()}`,
      reserved: Boolean(data.reserved ?? true),
      status: data.status || 'RESERVED',
    };
  }

  async captureReservation(
    payload: CaptureReservationPayload,
  ): Promise<CaptureReservationResult> {
    const response = await this.request('post', 'paths.walletCapture', payload);

    const data = response?.data ?? response;

    return {
      captureId:
        data.captureId || data.id || data.reference || `capture_${Date.now()}`,
      status: data.status || 'CAPTURED',
    };
  }

  async releaseReservation(
    reservationId: string,
  ): Promise<ReleaseReservationResult> {
    const response = await this.request('post', 'paths.walletRelease', {
      reservationId,
    });

    const data = response?.data ?? response;

    return {
      released: Boolean(data.released ?? true),
      status: data.status || 'RELEASED',
    };
  }

  async creditBalance(
    payload: CreditBalancePayload,
  ): Promise<CreditBalanceResult> {
    const response = await this.request('post', 'paths.walletCredit', payload);

    const data = response?.data ?? response;

    return {
      transactionId:
        data.transactionId || data.id || data.reference || `credit_${Date.now()}`,
      status: data.status || 'COMPLETED',
    };
  }

  private async request(
    method: 'get' | 'post',
    pathKey: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ): Promise<any> {
    const baseUrl = this.configService.get<string>('services.walletLedger');
    const path = this.configService.get<string>(pathKey);
    const token = this.configService.get<string>('internalAuthToken');
    const timeout = this.configService.get<number>('requestTimeoutMs');

    if (!baseUrl) {
      throw new BadGatewayException(
        'WALLET_LEDGER_SERVICE_URL/WALLET_LEDGER_URL no está configurado',
      );
    }

    try {
      const response =
        method === 'get'
          ? await lastValueFrom(
              this.httpService.get(`${baseUrl}${path}`, {
                timeout,
                params,
                headers: {
                  Authorization: `Bearer ${token}`,
                  'x-internal-auth': token,
                },
              }),
            )
          : await lastValueFrom(
              this.httpService.post(`${baseUrl}${path}`, body, {
                timeout,
                headers: {
                  Authorization: `Bearer ${token}`,
                  'x-internal-auth': token,
                },
              }),
            );

      return response.data;
    } catch (error: any) {
      throw new BadGatewayException(
        error?.response?.data?.message ||
          'Error consumiendo wallet-ledger',
      );
    }
  }
}