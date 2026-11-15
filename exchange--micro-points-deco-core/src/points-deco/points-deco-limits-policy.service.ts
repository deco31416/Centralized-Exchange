import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PointQuoteInput, PointService, RiskLevel } from './points-deco.interfaces';

type LimitDecision = 'ALLOW' | 'REVIEW' | 'BLOCK';

type LimitsPrecheckResponse = {
  decision: LimitDecision;
  allowed: boolean;
  canExecute: boolean;
  requiresApproval: boolean;
  holdRecommended: boolean;
  policyVersion: number | null;
  downstreamChecks?: Array<{
    name: string;
    status: 'PASS' | 'REVIEW' | 'FAIL' | 'SKIP';
    message: string;
  }>;
  reasons: string[];
  nextAction: string;
  evaluatedAt: string;
};

type PointsDecoPrecheckInput = PointQuoteInput & {
  userId?: string;
  pointId?: string;
  quote: {
    type: PointService;
    originCurrency: string;
    destinationCurrency: string;
    amountOrigin: number;
    amountDestinationEstimated: number;
  };
  operationId: string;
};

@Injectable()
export class PointsDecoLimitsPolicyService {
  constructor(private readonly configService: ConfigService) {}

  async precheck(input: PointsDecoPrecheckInput): Promise<LimitsPrecheckResponse> {
    const baseUrl = this.normalizeBaseUrl(
      this.configService.get<string>('LIMITS_POLICY_SERVICE_URL') ??
        'http://localhost:9031/api/v1',
    );
    const token = this.configService.get<string>('INTERNAL_AUTH_TOKEN') ?? 'change-me';
    const timeoutMs = Number(
      this.configService.get<string>('LIMITS_POLICY_TIMEOUT_MS') ?? 3000,
    );
    const payload = this.buildPayload(input);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/limits-policy/precheck`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-auth': token,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        return this.unavailableDecision(`limits-policy returned HTTP ${response.status}`);
      }

      return (await response.json()) as LimitsPrecheckResponse;
    } catch (error) {
      return this.unavailableDecision(
        error instanceof Error ? error.message : 'limits-policy unavailable',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildPayload(input: PointsDecoPrecheckInput) {
    const fiatSide = this.getFiatSide(input.quote);

    return {
      operation: this.mapOperation(input.quote.type),
      assetType: fiatSide ? 'FIAT' : 'ANY',
      product: this.mapProduct(input.quote.type),
      country: this.normalize(input.country, 'CO'),
      currency: fiatSide?.currency ?? input.quote.originCurrency,
      kycLevel: this.mapKycLevel(input.userKycLevel),
      riskLevel: this.mapRiskLevel(input.userRiskLevel),
      amount: fiatSide?.amount ?? input.quote.amountOrigin,
      userId: input.userId,
      operationId: input.operationId,
      idempotencyKey: `${input.operationId}:limits-precheck`,
      sourceService: 'exchange--micro-points-deco-core',
      requestedBy: input.userId || 'points-deco-gateway',
      metadata: {
        pointId: input.pointId ?? null,
        pointService: input.quote.type,
        originCurrency: input.quote.originCurrency,
        destinationCurrency: input.quote.destinationCurrency,
        amountOrigin: input.quote.amountOrigin,
        amountDestinationEstimated: input.quote.amountDestinationEstimated,
      },
    };
  }

  private getFiatSide(quote: PointsDecoPrecheckInput['quote']) {
    if (this.isFiatCurrency(quote.originCurrency)) {
      return { currency: quote.originCurrency, amount: quote.amountOrigin };
    }

    if (this.isFiatCurrency(quote.destinationCurrency)) {
      return {
        currency: quote.destinationCurrency,
        amount: quote.amountDestinationEstimated,
      };
    }

    return null;
  }

  private isFiatCurrency(currency: string) {
    return !['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'USDC', 'DECO'].includes(
      currency.toUpperCase(),
    );
  }

  private mapOperation(type: PointService) {
    const map: Record<PointService, string> = {
      cash_in: 'DEPOSIT',
      cash_out: 'WITHDRAW',
      remittance: 'REMITTANCE',
      fiat_exchange: 'CONVERT',
      stablecoin_exchange: 'CONVERT',
    };
    return map[type] ?? 'TRANSFER';
  }

  private mapProduct(type: PointService) {
    const map: Record<PointService, string> = {
      cash_in: 'FUNDING',
      cash_out: 'WITHDRAWALS',
      remittance: 'REMITTANCES',
      fiat_exchange: 'POINTS_DECO',
      stablecoin_exchange: 'POINTS_DECO',
    };
    return map[type] ?? 'POINTS_DECO';
  }

  private mapKycLevel(level?: string) {
    const normalized = this.normalize(level, 'LEVEL_1').replace(/\s+/g, '_');
    if (['1', 'LEVEL_1', 'BASIC', 'BASICO'].includes(normalized)) return 'LEVEL_1';
    if (['2', 'LEVEL_2', 'ADVANCED', 'AVANZADO'].includes(normalized)) return 'LEVEL_2';
    if (['3', 'LEVEL_3'].includes(normalized)) return 'LEVEL_3';
    if (['INSTITUTIONAL', 'INSTITUCIONAL', 'KYB'].includes(normalized)) {
      return 'INSTITUTIONAL';
    }
    return normalized.startsWith('LEVEL_') ? normalized : 'LEVEL_1';
  }

  private mapRiskLevel(level?: RiskLevel) {
    const normalized = this.normalize(level, 'GREEN');
    if (normalized === 'REVIEW') return 'ORANGE';
    return ['GREEN', 'ORANGE', 'RED'].includes(normalized) ? normalized : 'GREEN';
  }

  private unavailableDecision(message: string): LimitsPrecheckResponse {
    const failMode = this.normalize(
      this.configService.get<string>('POINTS_DECO_LIMITS_FAIL_MODE'),
      'REVIEW',
    );

    if (failMode === 'ALLOW') {
      return this.decision('ALLOW', `limits-policy unavailable: ${message}`);
    }

    if (failMode === 'BLOCK') {
      throw new ServiceUnavailableException({
        message: 'limits-policy unavailable for Puntos Deco precheck',
        detail: message,
      });
    }

    return this.decision('REVIEW', `limits-policy unavailable: ${message}`);
  }

  private decision(decision: LimitDecision, reason: string): LimitsPrecheckResponse {
    return {
      decision,
      allowed: decision === 'ALLOW',
      canExecute: decision === 'ALLOW',
      requiresApproval: decision === 'REVIEW',
      holdRecommended: decision !== 'BLOCK',
      policyVersion: null,
      downstreamChecks: [
        {
          name: 'limits-policy',
          status: decision === 'ALLOW' ? 'PASS' : decision === 'BLOCK' ? 'FAIL' : 'REVIEW',
          message: reason,
        },
      ],
      reasons: [reason],
      nextAction: decision === 'ALLOW' ? 'EXECUTE_WITH_AUDIT' : 'WAIT_FOR_ADMIN_APPROVAL',
      evaluatedAt: new Date().toISOString(),
    };
  }

  private normalize(value: string | undefined, fallback = '') {
    const normalized = value?.trim().toUpperCase();
    return normalized && normalized.length > 0 ? normalized : fallback;
  }

  private normalizeBaseUrl(value: string) {
    return value.replace(/\/+$/, '');
  }
}
