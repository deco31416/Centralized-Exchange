import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminAnalyticsKpi,
  AdminAnalyticsOverview,
  AnalyticsSourceStatus,
  AnalyticsPoint,
  AnalyticsRange,
} from './interfaces/admin-analytics.interface';
import { UpstreamClientService, UpstreamResult } from './upstream-client.service';

const supportedRanges: AnalyticsRange[] = ['7d', '30d', '90d'];

type UserCountResponse = { count?: number };
type LedgerStatsResponse = { totalTransactions?: number };
type P2pListResponse = unknown;
type KycRiskOverviewResponse = {
  totalCases?: number;
  open?: number;
  inReview?: number;
  escalated?: number;
};

@Injectable()
export class AdminAnalyticsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly upstreamClient: UpstreamClientService,
  ) {}

  async getOverview(range: string | undefined): Promise<AdminAnalyticsOverview> {
    const normalizedRange = this.normalizeRange(range);
    const [
      usersResult,
      ledgerResult,
      p2pOrdersResult,
      p2pDisputesResult,
      kycRiskResult,
    ] = await Promise.all([
      this.upstreamClient.get<UserCountResponse>(
        this.configService.get<string>('AUTH_SERVICE_URL'),
        '/api/v1/internal/users/count',
      ),
      this.upstreamClient.get<LedgerStatsResponse>(
        this.configService.get<string>('WALLET_LEDGER_SERVICE_URL'),
        '/api/v1/internal/ledger/stats',
      ),
      this.upstreamClient.get<P2pListResponse>(
        this.configService.get<string>('P2P_CORE_SERVICE_URL'),
        '/api/v1/admin/p2p/orders?page=1&limit=1',
      ),
      this.upstreamClient.get<P2pListResponse>(
        this.configService.get<string>('P2P_CORE_SERVICE_URL'),
        '/api/v1/admin/p2p/disputes/open',
      ),
      this.upstreamClient.get<KycRiskOverviewResponse>(
        this.configService.get<string>('KYC_RISK_SERVICE_URL'),
        '/api/v1/kyc-risk/overview',
      ),
    ]);

    const sources = [
      this.toSourceStatus('auth', 'Usuarios', usersResult),
      this.toSourceStatus('wallet-ledger', 'Ledger', ledgerResult),
      this.toSourceStatus('p2p-orders', 'Ordenes P2P', p2pOrdersResult),
      this.toSourceStatus('p2p-disputes', 'Disputas P2P', p2pDisputesResult),
      this.toSourceStatus('kyc-risk', 'KYC + riesgo', kycRiskResult),
    ];
    const connectedSources = sources.filter((source) => source.status === 'connected').length;
    const source = connectedSources > 0 ? 'aggregated' : 'empty';

    return {
      generatedAt: new Date().toISOString(),
      range: normalizedRange,
      dataCompleteness: Math.round((connectedSources / sources.length) * 100),
      source,
      sources,
      totals: {
        users: this.numberFromResult(usersResult, 'count'),
        operations:
          this.numberFromResult(ledgerResult, 'totalTransactions') +
          this.countFromListResult(p2pOrdersResult),
        volumeUsd: 0,
        revenueUsd: 0,
        riskCases:
          this.numberFromResult(kycRiskResult, 'totalCases') +
          this.countFromListResult(p2pDisputesResult),
      },
    };
  }

  getSeries(range: string | undefined): AnalyticsPoint[] {
    const days = this.rangeToDays(this.normalizeRange(range));
    const today = new Date();

    return Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - index - 1));

      return {
        date: date.toISOString().slice(0, 10),
        users: 0,
        operations: 0,
        volumeUsd: 0,
        revenueUsd: 0,
      };
    });
  }

  async getKpis(): Promise<AdminAnalyticsKpi[]> {
    const overview = await this.getOverview(undefined);
    const totals = overview.totals;

    return [
      this.toKpi('activeUsers', 'Usuarios activos', totals.users, 'count'),
      this.toKpi('operations', 'Operaciones', totals.operations, 'count'),
      this.toKpi('volumeUsd', 'Volumen USD', totals.volumeUsd, 'usd'),
      this.toKpi('revenueUsd', 'Revenue USD', totals.revenueUsd, 'usd'),
      this.toKpi('riskCases', 'Casos de riesgo', totals.riskCases, 'count'),
    ];
  }

  private toKpi(
    key: string,
    label: string,
    value: number,
    unit: AdminAnalyticsKpi['unit'],
  ): AdminAnalyticsKpi {
    return {
      key,
      label,
      value,
      unit,
      status: value > 0 ? 'connected' : 'connected_empty',
    };
  }

  private normalizeRange(range: string | undefined): AnalyticsRange {
    if (range && supportedRanges.includes(range as AnalyticsRange)) {
      return range as AnalyticsRange;
    }

    return '30d';
  }

  private toSourceStatus<T>(
    key: string,
    label: string,
    result: UpstreamResult<T>,
  ): AnalyticsSourceStatus {
    return {
      key,
      label,
      status: result.ok ? 'connected' : 'unavailable',
      detail: result.ok ? `HTTP ${result.status} en ${result.elapsedMs}ms` : result.error,
      checkedAt: new Date().toISOString(),
    };
  }

  private numberFromResult<T extends object>(
    result: UpstreamResult<T>,
    key: string,
  ): number {
    if (!result.ok) return 0;
    const value = (result.data as Record<string, unknown>)[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  private countFromListResult(result: UpstreamResult<P2pListResponse>): number {
    if (!result.ok) return 0;
    if (Array.isArray(result.data)) {
      return result.data.length;
    }

    if (!this.isRecord(result.data)) {
      return 0;
    }

    if (typeof result.data.total === 'number' && Number.isFinite(result.data.total)) {
      return result.data.total;
    }

    const list = result.data.orders || result.data.disputes || result.data.items;
    return Array.isArray(list) ? list.length : 0;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private rangeToDays(range: AnalyticsRange): number {
    if (range === '7d') return 7;
    if (range === '90d') return 90;
    return 30;
  }
}
