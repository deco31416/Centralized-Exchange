import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface WalletSummaryResponse {
  totalValueUSD?: string;
  portfolioChange24h?: string;
  fiatTotalUSD?: string;
  cryptoTotalUSD?: string;
  balancesByCurrency?: Record<string, number | string>;
}

@Injectable()
export class WalletLedgerClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getHeaders() {
    return {
      'x-internal-auth':
        this.configService.get<string>('internalAuthToken') || '',
    };
  }

  async ensureWallet(userId: string, currency: string) {
    const baseUrl = this.configService.get<string>('services.walletLedger');
    if (!baseUrl) {
      return {
        connected: false,
        skipped: true,
        message: 'Wallet Ledger URL is not configured',
      };
    }

    try {
      const { data: account } = await firstValueFrom(
        this.httpService.post(
          `${baseUrl.replace(/\/$/, '')}/internal/accounts/ensure/${encodeURIComponent(
            userId,
          )}`,
          {},
          { headers: this.getHeaders(), timeout: 10000 },
        ),
      );

      const { data: wallet } = await firstValueFrom(
        this.httpService.post(
          `${baseUrl.replace(/\/$/, '')}/internal/wallets/ensure`,
          {
            accountId: account.accountId,
            currency: currency.toUpperCase(),
          },
          { headers: this.getHeaders(), timeout: 10000 },
        ),
      );

      return {
        connected: true,
        skipped: false,
        account,
        wallet,
      };
    } catch (error: any) {
      throw new ServiceUnavailableException({
        message:
          'Wallet Ledger service is unavailable while ensuring wallet',
        source: 'wallet-ledger',
        detail:
          error?.response?.data || error?.message || 'Unknown wallet ensure error',
      });
    }
  }

  async getUserBalanceSummary(
    userId: string,
  ): Promise<WalletSummaryResponse | null> {
    const baseUrl = this.configService.get<string>('services.walletLedger');
    if (!baseUrl) return null;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<WalletSummaryResponse>(
          `${baseUrl.replace(/\/$/, '')}/internal/wallets/user/${encodeURIComponent(
            userId,
          )}/summary`,
          {
            headers: this.getHeaders(),
            timeout: 10000,
          },
        ),
      );

      return data;
    } catch (error: any) {
      throw new ServiceUnavailableException({
        message:
          'Wallet Ledger service is unavailable while fetching summary',
        source: 'wallet-ledger',
        detail:
          error?.response?.data || error?.message || 'Unknown wallet summary error',
      });
    }
  }

  async assertEnoughBalance(userId: string, currency: string, amount: number) {
    const summary = await this.getUserBalanceSummary(userId);
    if (!summary) {
      return {
        checked: false,
        availableAmount: null,
        currency: currency.toUpperCase(),
        message: 'Wallet Ledger URL is not configured',
      };
    }

    const rawAvailable =
      summary.balancesByCurrency?.[currency.toUpperCase()] ?? 0;
    const availableAmount = Number(rawAvailable);

    if (availableAmount < amount) {
      throw new BadRequestException({
        message: `Insufficient ${currency.toUpperCase()} balance in wallet ledger`,
        availableAmount,
        requiredAmount: amount,
        currency: currency.toUpperCase(),
      });
    }

    return {
      checked: true,
      availableAmount,
      currency: currency.toUpperCase(),
      message: 'Wallet balance validated successfully',
    };
  }

  async creditUserWalletFromSavings(input: {
    userId: string;
    currency: string;
    amount: number;
    savingId: string;
    movementId: string;
  }) {
    const baseUrl = this.configService.get<string>('services.walletLedger');
    if (!baseUrl) {
      return {
        connected: false,
        skipped: true,
        message: 'Wallet Ledger URL is not configured',
      };
    }

    const amountMinorUnits = this.toMinorUnitsString(
      input.amount,
      input.currency,
    );

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${baseUrl.replace(/\/$/, '')}/internal/ledger/fiat-deposit-confirmed`,
          {
            eventId: `SAVINGS_WITHDRAW_${input.movementId}`,
            userId: input.userId,
            currency: input.currency.toUpperCase(),
            amountMinorUnits,
            externalRef: {
              source: 'savings-core',
              savingId: input.savingId,
              movementId: input.movementId,
              reason: 'Savings withdrawal credited to wallet',
            },
          },
          {
            headers: this.getHeaders(),
            timeout: 10000,
          },
        ),
      );

      return {
        connected: true,
        skipped: false,
        credited: true,
        amountMinorUnits,
        response: data,
      };
    } catch (error: any) {
      throw new ServiceUnavailableException({
        message:
          'Wallet Ledger service is unavailable while crediting withdrawal',
        source: 'wallet-ledger',
        detail:
          error?.response?.data || error?.message || 'Unknown wallet credit error',
      });
    }
  }

  private toMinorUnitsString(amount: number, currency: string) {
    const decimalsMap: Record<string, number> = {
      MXN: 2,
      USD: 2,
      COP: 2,
      PEN: 2,
      SVC: 2,
      BTC: 8,
      ETH: 8,
      BNB: 8,
      USDT: 6,
      USDC: 6,
      DECOX: 6,
      DECO: 6,
    };

    const decimals = decimalsMap[currency.toUpperCase()] ?? 2;
    return Math.round(amount * 10 ** decimals).toString();
  }
}