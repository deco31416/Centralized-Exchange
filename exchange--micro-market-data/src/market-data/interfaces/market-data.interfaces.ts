export type MarketDataSourceState = 'connected' | 'degraded' | 'unconfigured';

export type UpstreamPrice = {
  assetCode?: string;
  code?: string;
  symbol?: string;
  name?: string;
  assetName?: string;
  priceUsd?: number | string;
  usdPrice?: number | string;
  price?: number | string;
  source?: string;
  type?: string;
  updatedAt?: string;
  timestamp?: string;
};

export type PricesAllResponse = {
  prices?: UpstreamPrice[];
  count?: number;
  timestamp?: string;
};

export type MarketAssetType = 'crypto' | 'fiat' | 'launchpad' | 'unknown';

export type MarketAsset = {
  symbol: string;
  name: string;
  type: MarketAssetType;
  priceUsd: number | null;
  updatedAt: string;
  source: string;
};

export type MarketTicker = MarketAsset & {
  pair: string;
  quote: 'USD';
  change24hPercent: number | null;
  volume24hUsd: number | null;
  status: 'live' | 'reference' | 'unavailable';
};

export type MarketDataSourceStatus = {
  name: string;
  state: MarketDataSourceState;
  upstream: string;
  elapsedMs: number;
  error?: string;
  checkedAt: string;
};
