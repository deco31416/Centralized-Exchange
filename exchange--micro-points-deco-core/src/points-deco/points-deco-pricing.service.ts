import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PointService } from './points-deco.interfaces';

export interface PointsDecoPricingQuote {
  rate: number;
  source: 'pricing-fee-fiat' | 'local-fallback';
  operation: 'BUY' | 'SELL';
  corridor: string;
  method?: string;
  warning?: string;
  raw?: Record<string, unknown>;
}

@Injectable()
export class PointsDecoPricingService {
  constructor(private readonly configService: ConfigService) {}

  async quote(input: {
    type: PointService;
    originCurrency: string;
    destinationCurrency: string;
  }): Promise<PointsDecoPricingQuote> {
    const operation = this.mapOperation(input.type);
    const corridor = this.configService.get<string>('POINTS_DECO_PRICING_CORRIDOR', 'retail');
    const serviceUrl = this.configService.get<string>('PRICING_FIAT_SERVICE_URL');

    const pricingPair = this.toPricingPair(input.originCurrency, input.destinationCurrency);

    if (!serviceUrl || !pricingPair) {
      return this.fallback(input, operation, corridor);
    }

    const timeoutMs = Number(
      this.configService.get<string>('POINTS_DECO_PRICING_TIMEOUT_MS', '3000'),
    );

    try {
      const response = await this.fetchWithTimeout(
        `${serviceUrl.replace(/\/$/, '')}/internal/pricing/fiat/quote/${pricingPair.base}/${pricingPair.quote}/${corridor}/${operation}`,
        timeoutMs,
      );

      if (!response.ok) {
        return this.fallback(input, operation, corridor, `pricing HTTP ${response.status}`);
      }

      const data = (await response.json()) as Record<string, unknown>;
      const rate = this.extractRate(data);

      if (!Number.isFinite(rate) || rate <= 0) {
        return this.fallback(input, operation, corridor, 'pricing returned invalid rate');
      }

      return {
        rate,
        source: 'pricing-fee-fiat',
        operation,
        corridor,
        method: this.toString(data.rateMethod) || this.toString(data.method),
        raw: {
          ...data,
          requestedOriginCurrency: input.originCurrency,
          requestedDestinationCurrency: input.destinationCurrency,
          pricingBaseCurrency: pricingPair.base,
          pricingQuoteCurrency: pricingPair.quote,
        },
      };
    } catch (error) {
      return this.fallback(
        input,
        operation,
        corridor,
        error instanceof Error ? error.message : 'pricing unavailable',
      );
    }
  }

  private async fetchWithTimeout(url: string, timeoutMs: number) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        headers: this.buildHeaders(),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildHeaders(): Record<string, string> {
    const token = this.configService.get<string>('INTERNAL_AUTH_TOKEN');
    return token ? { 'x-internal-token': token } : {};
  }

  private extractRate(data: Record<string, unknown>) {
    for (const key of ['finalRate', 'rate', 'baseRate', 'rateAfterDelta']) {
      const value = Number(data[key]);
      if (Number.isFinite(value) && value > 0) return value;
    }

    return 0;
  }

  private fallback(
    input: {
      originCurrency: string;
      destinationCurrency: string;
    },
    operation: 'BUY' | 'SELL',
    corridor: string,
    warning?: string,
  ): PointsDecoPricingQuote {
    return {
      rate: this.estimateRate(input.originCurrency, input.destinationCurrency),
      source: 'local-fallback',
      operation,
      corridor,
      warning,
    };
  }

  private estimateRate(originCurrency: string, destinationCurrency: string) {
    if (originCurrency === 'COP' && destinationCurrency === 'USDT') return 4000;
    if (originCurrency === 'USDT' && destinationCurrency === 'COP') return 1 / 4000;
    return 1;
  }

  private toPricingPair(originCurrency: string, destinationCurrency: string) {
    const base = this.toFiatPricingCurrency(destinationCurrency);
    const quote = this.toFiatPricingCurrency(originCurrency);

    if (!base || !quote) return null;
    return { base, quote };
  }

  private toFiatPricingCurrency(currency: string) {
    if (['USDT', 'USDC'].includes(currency)) return 'USD';
    return this.isFiatCurrency(currency) ? currency : null;
  }

  private isFiatCurrency(currency: string) {
    return [
      'USD',
      'COP',
      'EUR',
      'MXN',
      'CLP',
      'PEN',
      'ARS',
      'VES',
      'AWG',
      'BRL',
      'DOP',
      'CAD',
    ].includes(currency);
  }

  private mapOperation(type: PointService): 'BUY' | 'SELL' {
    return ['cash_out', 'remittance'].includes(type) ? 'SELL' : 'BUY';
  }

  private toString(value: unknown) {
    return typeof value === 'string' ? value : undefined;
  }
}
