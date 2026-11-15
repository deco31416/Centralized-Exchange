export type MarketChartProvider = "TradingView" | "Deco Chart";

export type MarketKind = "spot" | "futures" | "ecosystem" | "otc";

export type MarketInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export interface MarketPairMetadata {
  symbol: string;
  pair: string;
  base: string;
  quote: string;
  market: string;
  kind: MarketKind;
  provider: MarketChartProvider;
  tradingViewSymbol?: string;
  active: boolean;
}

export interface MarketTicker {
  symbol: string;
  pair: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
  updatedAt: string;
  stale?: boolean;
}

export interface MarketCandle {
  symbol: string;
  interval: MarketInterval;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketOrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface MarketOrderBook {
  symbol: string;
  bids: MarketOrderBookLevel[];
  asks: MarketOrderBookLevel[];
  updatedAt: string;
  stale?: boolean;
}

export interface MarketTrade {
  id: string;
  symbol: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
  timestamp: string;
}

export interface MarketDataEnvelope<T> {
  data: T;
  source: "backend" | "fallback";
  updatedAt: string;
}
