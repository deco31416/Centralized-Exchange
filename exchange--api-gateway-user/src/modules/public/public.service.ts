import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface UnifiedPrice {
  assetCode: string;
  source: 'fiat' | 'crypto' | 'launchpad' | 'stablecoin';
  updatedAt: string;
}

interface PricesAllResponse {
  prices?: UnifiedPrice[];
}

export interface LandingStatsData {
  transactions: number;
  cryptocurrencies: number;
  fiatMoney: number;
  users: number;
  updatedAt: string;
}

export interface LandingStatsResponse {
  success: boolean;
  data: LandingStatsData;
  sources: {
    transactions: 'real' | 'unavailable' | 'temporary_static';
    cryptocurrencies: 'real' | 'unavailable' | 'temporary_static';
    fiatMoney: 'real' | 'unavailable' | 'temporary_static';
    users: 'real' | 'unavailable' | 'temporary_static';
  };
}

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);
  private readonly pricingUrl: string;
  private readonly authUrl: string;
  private readonly walletUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pricingUrl =
      this.configService.get<string>('config.services.pricing') ||
      'http://localhost:3013';
    this.authUrl =
      this.configService.get<string>('config.services.auth') ||
      'http://localhost:7000';
    this.walletUrl =
      this.configService.get<string>('config.services.wallet-ledger') ||
      'http://localhost:9001';
    this.internalToken =
      this.configService.get<string>('config.internalAuthToken') || '';
  }

  async getLandingStats(): Promise<LandingStatsResponse> {
    let cryptocurrencies = 18;
    let fiatMoney = 3;
    let cryptoSource: 'real' | 'unavailable' | 'temporary_static' = 'temporary_static';
    let fiatSource: 'real' | 'unavailable' | 'temporary_static' = 'temporary_static';

    const headers = { 'x-internal-auth': this.internalToken };

    const [pricingResult, usersResult, transactionsResult] =
      await Promise.allSettled([
        firstValueFrom(
          this.http.get<PricesAllResponse | UnifiedPrice[]>(
            `${this.pricingUrl}/api/v1/prices/all`,
            { headers, timeout: 5000 },
          ),
        ),
        firstValueFrom(
          this.http.get<{ count: number }>(
            `${this.authUrl}/api/v1/internal/users/count`,
            { headers, timeout: 5000 },
          ),
        ),
        firstValueFrom(
          this.http.get<{ totalTransactions: number }>(
            `${this.walletUrl}/api/v1/internal/ledger/stats`,
            { headers, timeout: 5000 },
          ),
        ),
      ]);

    if (pricingResult.status === 'fulfilled') {
      const prices: UnifiedPrice[] = Array.isArray(pricingResult.value.data)
        ? pricingResult.value.data
        : (pricingResult.value.data as PricesAllResponse)?.prices ?? [];

      const cryptoCount = prices.filter(
        (p) => p.source === 'crypto' || p.source === 'launchpad',
      ).length;
      const fiatCount = prices.filter((p) => p.source === 'fiat').length;

      if (cryptoCount > 0) { cryptocurrencies = cryptoCount; cryptoSource = 'real'; }
      if (fiatCount > 0) { fiatMoney = fiatCount; fiatSource = 'real'; }
    } else {
      this.logger.warn(
        `[PublicService] pricing-aggregator unreachable: ${(pricingResult.reason as Error).message}`,
      );
    }

    let users = 0;
    let usersSource: 'real' | 'unavailable' = 'unavailable';
    if (usersResult.status === 'fulfilled') {
      users = usersResult.value.data.count ?? 0;
      usersSource = 'real';
    } else {
      this.logger.warn(
        `[PublicService] micro-auth unreachable: ${(usersResult.reason as Error).message}`,
      );
    }

    let transactions = 0;
    let txSource: 'real' | 'unavailable' = 'unavailable';
    if (transactionsResult.status === 'fulfilled') {
      transactions = transactionsResult.value.data.totalTransactions ?? 0;
      txSource = 'real';
    } else {
      this.logger.warn(
        `[PublicService] wallet-ledger unreachable: ${(transactionsResult.reason as Error).message}`,
      );
    }

    return {
      success: true,
      data: {
        transactions,
        cryptocurrencies,
        fiatMoney,
        users,
        updatedAt: new Date().toISOString(),
      },
      sources: {
        transactions: txSource,
        cryptocurrencies: cryptoSource,
        fiatMoney: fiatSource,
        users: usersSource,
      },
    };
  }
}
