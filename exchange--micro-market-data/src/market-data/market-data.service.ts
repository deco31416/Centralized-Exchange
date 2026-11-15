import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MarketAsset,
  MarketAssetType,
  MarketDataSourceStatus,
  MarketTicker,
  PricesAllResponse,
  UpstreamPrice,
} from './interfaces/market-data.interfaces';
import { UpstreamClientService } from './upstream-client.service';

@Injectable()
export class MarketDataService {
  constructor(
    private readonly configService: ConfigService,
    private readonly upstreamClient: UpstreamClientService,
  ) {}

  async getOverview() {
    const snapshot = await this.getSnapshot();
    const assets = snapshot.assets;
    const crypto = assets.filter((asset) => asset.type === 'crypto').length;
    const fiat = assets.filter((asset) => asset.type === 'fiat').length;
    const launchpad = assets.filter((asset) => asset.type === 'launchpad').length;

    return {
      summary: {
        totalAssets: assets.length,
        crypto,
        fiat,
        launchpad,
        tickers: snapshot.tickers.length,
      },
      topTickers: snapshot.tickers.slice(0, 12),
      sources: snapshot.sources,
      updatedAt: snapshot.updatedAt,
    };
  }

  async getAssets() {
    const snapshot = await this.getSnapshot();
    return {
      assets: snapshot.assets,
      count: snapshot.assets.length,
      sources: snapshot.sources,
      updatedAt: snapshot.updatedAt,
    };
  }

  async getTickers() {
    const snapshot = await this.getSnapshot();
    return {
      tickers: snapshot.tickers,
      count: snapshot.tickers.length,
      sources: snapshot.sources,
      updatedAt: snapshot.updatedAt,
    };
  }

  async getTicker(symbol: string) {
    const snapshot = await this.getSnapshot();
    const normalizedSymbol = symbol.trim().toUpperCase();
    const ticker = snapshot.tickers.find((item) => item.symbol === normalizedSymbol);

    return {
      ticker: ticker ?? null,
      found: Boolean(ticker),
      sources: snapshot.sources,
      updatedAt: snapshot.updatedAt,
    };
  }

  async getStatus() {
    const snapshot = await this.getSnapshot();
    return {
      ok: snapshot.sources.every((source) => source.state === 'connected'),
      sources: snapshot.sources,
      updatedAt: snapshot.updatedAt,
    };
  }

  private async getSnapshot(): Promise<{
    assets: MarketAsset[];
    tickers: MarketTicker[];
    sources: MarketDataSourceStatus[];
    updatedAt: string;
  }> {
    const pricingUrl = this.configService.get<string>('PRICING_AGGREGATOR_URL');
    const checkedAt = new Date().toISOString();
    const pricesResult = await this.upstreamClient.get<PricesAllResponse | UpstreamPrice[]>(
      pricingUrl,
      '/api/v1/prices/all',
    );

    if (!pricesResult.ok) {
      return {
        assets: [],
        tickers: [],
        sources: [
          {
            name: 'pricing-aggregator',
            state:
              pricesResult.error === 'upstream_url_not_configured'
                ? 'unconfigured'
                : 'degraded',
            upstream: pricingUrl ?? 'not_configured',
            elapsedMs: pricesResult.elapsedMs,
            error: pricesResult.error,
            checkedAt,
          },
        ],
        updatedAt: checkedAt,
      };
    }

    const rawPrices = Array.isArray(pricesResult.data)
      ? pricesResult.data
      : pricesResult.data.prices ?? [];
    const assets = rawPrices.map((price) => this.normalizeAsset(price));
    const tickers = assets.map((asset) => this.toTicker(asset));

    return {
      assets,
      tickers,
      sources: [
        {
          name: 'pricing-aggregator',
          state: 'connected',
          upstream: pricingUrl ?? 'not_configured',
          elapsedMs: pricesResult.elapsedMs,
          checkedAt,
        },
      ],
      updatedAt: checkedAt,
    };
  }

  private normalizeAsset(price: UpstreamPrice): MarketAsset {
    const symbol = String(price.assetCode ?? price.code ?? price.symbol ?? 'UNKNOWN')
      .trim()
      .toUpperCase();
    const source = String(price.source ?? price.type ?? 'unknown').toLowerCase();
    const updatedAt = price.updatedAt ?? price.timestamp ?? new Date().toISOString();

    return {
      symbol,
      name: String(price.name ?? price.assetName ?? symbol),
      type: this.normalizeType(source),
      priceUsd: this.toNumber(price.priceUsd ?? price.usdPrice ?? price.price),
      updatedAt,
      source,
    };
  }

  private toTicker(asset: MarketAsset): MarketTicker {
    return {
      ...asset,
      pair: `${asset.symbol}/USD`,
      quote: 'USD',
      change24hPercent: null,
      volume24hUsd: null,
      status: asset.priceUsd === null ? 'unavailable' : 'reference',
    };
  }

  private normalizeType(value: string): MarketAssetType {
    if (value.includes('crypto')) return 'crypto';
    if (value.includes('fiat')) return 'fiat';
    if (value.includes('launchpad')) return 'launchpad';
    return 'unknown';
  }

  private toNumber(value: number | string | undefined): number | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
