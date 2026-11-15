import type {
  MarketCandle,
  MarketInterval,
  MarketOrderBook,
  MarketPairMetadata,
  MarketTicker,
  MarketTrade,
} from "@/types/markets";

async function marketFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  const res = await fetch(`/api/markets/${path}${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Market BFF ${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const MarketDataService = {
  listPairs(): Promise<{ items: MarketPairMetadata[]; count: number; source?: "backend" | "fallback" }> {
    return marketFetch("pairs");
  },

  getTicker(symbol: string): Promise<MarketTicker> {
    return marketFetch("ticker", { symbol });
  },

  getCandles(
    symbol: string,
    interval: MarketInterval = "1d",
    limit = 120,
  ): Promise<{ items: MarketCandle[]; count: number }> {
    return marketFetch("candles", { symbol, interval, limit });
  },

  getOrderBook(symbol: string, depth = 20): Promise<MarketOrderBook> {
    return marketFetch("order-book", { symbol, depth });
  },

  getTrades(symbol: string, limit = 50): Promise<{ items: MarketTrade[]; count: number }> {
    return marketFetch("trades", { symbol, limit });
  },
};
