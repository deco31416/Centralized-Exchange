import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type EnsureAccountResponse = {
  accountId: string;
  userId: string;
  accountNumber: string;
  status: string;
};

type EnsureWalletResponse = {
  walletId: string;
  accountId: string;
  currency: string;
  availableMinorUnits: string;
  lockedMinorUnits: string;
  status: string;
};

type UserBalancesResponse = {
  userId: string;
  accountId: string;
  accountNumber: string;
  balances: Array<{
    walletId: string;
    accountId: string;
    accountNumber: string;
    currency: string;
    availableMinorUnits: string;
    lockedMinorUnits: string;
    availableFormatted: string;
    lockedFormatted: string;
    status: string;
  }>;
  totalBalancesCount: number;
};

type ReserveBalanceResponse = {
  reserved: boolean;
  reservationId: string;
  correlationId: string;
  userId: string;
  accountId: string;
  asset: string;
  quoteId: string;
  amountMinorUnits: string;
  amountFormatted: string;
  availableBefore: string;
  availableAfter: string;
  lockedBefore: string;
  lockedAfter: string;
  availableBeforeFormatted: string;
  availableAfterFormatted: string;
  lockedBeforeFormatted: string;
  lockedAfterFormatted: string;
  status: string;
};

@Injectable()
export class WalletLedgerClientService {
  private readonly logger = new Logger(WalletLedgerClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getBaseUrl() {
    return (
      this.configService
        .get<string>('services.walletLedger')
        ?.replace(/\/$/, '') || ''
    );
  }

  private getToken() {
    return this.configService.get<string>('internalAuthToken') || '';
  }

  private getHeaders() {
    const token = this.getToken();

    return {
      Authorization: `Bearer ${token}`,
      'x-internal-auth': token,
    };
  }

  async getAvailableBalance(userId: string, asset: string) {
    const baseUrl = this.getBaseUrl();
    const token = this.getToken();

    if (!baseUrl || !token) {
      throw new ServiceUnavailableException(
        'Wallet Ledger service is not configured correctly',
      );
    }

    try {
      const ensureAccountResponse = await firstValueFrom(
        this.httpService.post<EnsureAccountResponse>(
          `${baseUrl}/internal/accounts/ensure/${encodeURIComponent(userId)}`,
          {},
          {
            headers: this.getHeaders(),
            timeout: 10000,
          },
        ),
      );

      const account = ensureAccountResponse.data;

      await firstValueFrom(
        this.httpService.post<EnsureWalletResponse>(
          `${baseUrl}/internal/wallets/ensure`,
          {
            accountId: account.accountId,
            currency: asset.toUpperCase(),
          },
          {
            headers: this.getHeaders(),
            timeout: 10000,
          },
        ),
      );

      const balancesResponse = await firstValueFrom(
        this.httpService.get<UserBalancesResponse>(
          `${baseUrl}/internal/wallets/user/${encodeURIComponent(userId)}`,
          {
            headers: this.getHeaders(),
            timeout: 10000,
          },
        ),
      );

      const balance = balancesResponse.data.balances.find(
        (item) => item.currency.toUpperCase() === asset.toUpperCase(),
      );

      if (!balance) {
        return {
          source: 'wallet-ledger',
          connected: true,
          userId,
          asset: asset.toUpperCase(),
          availableBalance: 0,
          availableMinorUnits: '0',
          currency: asset.toUpperCase(),
          message: 'Wallet exists but no balance was found for requested asset',
        };
      }

      return {
        source: 'wallet-ledger',
        connected: true,
        userId,
        asset: asset.toUpperCase(),
        availableBalance: Number(balance.availableFormatted || 0),
        availableMinorUnits: balance.availableMinorUnits,
        lockedMinorUnits: balance.lockedMinorUnits,
        currency: balance.currency,
        walletId: balance.walletId,
        accountId: balance.accountId,
        message: 'Wallet balance retrieved successfully',
      };
    } catch (error: any) {
      this.logger.error(
        `Balance lookup failed for userId=${userId}, asset=${asset}: ${error?.message || error}`,
      );

      throw new ServiceUnavailableException(
        'Unable to get available balance from wallet ledger',
      );
    }
  }

  async reserveBalance(payload: {
    userId: string;
    asset: string;
    amountMinorUnits: string;
    quoteId: string;
  }) {
    const baseUrl = this.getBaseUrl();
    const token = this.getToken();

    if (!baseUrl || !token) {
      throw new ServiceUnavailableException(
        'Wallet Ledger service is not configured correctly',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<ReserveBalanceResponse>(
          `${baseUrl}/internal/wallets/reserve`,
          {
            userId: payload.userId,
            asset: payload.asset,
            amountMinorUnits: payload.amountMinorUnits,
            quoteId: payload.quoteId,
          },
          {
            headers: this.getHeaders(),
            timeout: 15000,
          },
        ),
      );

      return {
        source: 'wallet-ledger',
        connected: true,
        reserved: response.data.reserved,
        reservationId: response.data.reservationId,
        raw: response.data,
      };
    } catch (error: any) {
      this.logger.error(
        `Reserve balance failed for userId=${payload.userId}, asset=${payload.asset}: ${error?.message || error}`,
      );

      throw new ServiceUnavailableException(
        'Unable to reserve balance in wallet ledger',
      );
    }
  }
}