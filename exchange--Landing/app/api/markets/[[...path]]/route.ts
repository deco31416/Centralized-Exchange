import { NextRequest, NextResponse } from "next/server";
import { getPricingAggregatorBaseUrl } from "../../_shared/gateway";
import { getInternalAuthToken } from "../../_shared/internal-auth";
import type {
  MarketCandle,
  MarketInterval,
  MarketOrderBook,
  MarketPairMetadata,
  MarketTicker,
  MarketTrade,
} from "@/types/markets";

export const dynamic = "force-dynamic";

const DEFAULT_MARKET_BACKEND_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 2500 : 800;

function marketBackendTimeoutMs(): number {
  const configured = Number(process.env.MARKET_BACKEND_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return DEFAULT_MARKET_BACKEND_TIMEOUT_MS;
}

const fallbackPairs: MarketPairMetadata[] = [
  { symbol: "BTCUSDT", pair: "BTC/USDT", base: "BTC", quote: "USDT", market: "Principal", kind: "spot", provider: "TradingView", tradingViewSymbol: "BINANCE:BTCUSDT", active: true },
  { symbol: "ETHUSDT", pair: "ETH/USDT", base: "ETH", quote: "USDT", market: "Principal", kind: "spot", provider: "TradingView", tradingViewSymbol: "BINANCE:ETHUSDT", active: true },
  { symbol: "SOLUSDT", pair: "SOL/USDT", base: "SOL", quote: "USDT", market: "Altcoin", kind: "spot", provider: "TradingView", tradingViewSymbol: "BINANCE:SOLUSDT", active: true },
  { symbol: "BNBUSDT", pair: "BNB/USDT", base: "BNB", quote: "USDT", market: "Principal", kind: "spot", provider: "TradingView", tradingViewSymbol: "BINANCE:BNBUSDT", active: true },
  { symbol: "DECOUSDT", pair: "DECO/USDT", base: "DECO", quote: "USDT", market: "Ecosistema", kind: "ecosystem", provider: "Deco Chart", active: true },
  { symbol: "DECOXUSDT", pair: "DECOX/USDT", base: "DECOX", quote: "USDT", market: "Ecosistema", kind: "ecosystem", provider: "Deco Chart", active: true },
  { symbol: "BTCUSDT", pair: "BTCUSDT Perp", base: "BTC", quote: "USDT", market: "USDT-M", kind: "futures", provider: "TradingView", tradingViewSymbol: "BINANCE:BTCUSDTPERP", active: true },
  { symbol: "ETHUSDT", pair: "ETHUSDT Perp", base: "ETH", quote: "USDT", market: "USDT-M", kind: "futures", provider: "TradingView", tradingViewSymbol: "BINANCE:ETHUSDTPERP", active: true },
  { symbol: "SOLUSDT", pair: "SOLUSDT Perp", base: "SOL", quote: "USDT", market: "USDT-M", kind: "futures", provider: "TradingView", tradingViewSymbol: "BINANCE:SOLUSDTPERP", active: true },
  { symbol: "DECOUSDT", pair: "DECOUSDT Perp", base: "DECO", quote: "USDT", market: "Ecosistema", kind: "futures", provider: "Deco Chart", active: true },
];

const fallbackTickers: Record<string, Omit<MarketTicker, "updatedAt" | "stale">> = {
  BTCUSDT: { symbol: "BTCUSDT", pair: "BTC/USDT", price: 67420.5, change24h: 2.18, volume24h: 1280000000, high24h: 68120.3, low24h: 65980.2 },
  ETHUSDT: { symbol: "ETHUSDT", pair: "ETH/USDT", price: 3412.8, change24h: 1.34, volume24h: 840000000, high24h: 3488.4, low24h: 3340.1 },
  SOLUSDT: { symbol: "SOLUSDT", pair: "SOL/USDT", price: 148.22, change24h: -0.74, volume24h: 210000000, high24h: 152.4, low24h: 145.8 },
  BNBUSDT: { symbol: "BNBUSDT", pair: "BNB/USDT", price: 612.1, change24h: 0.62, volume24h: 320000000, high24h: 618.2, low24h: 604.4 },
  DECOUSDT: { symbol: "DECOUSDT", pair: "DECO/USDT", price: 0.3141, change24h: 4.2, volume24h: 18000000, high24h: 0.322, low24h: 0.298 },
  DECOXUSDT: { symbol: "DECOXUSDT", pair: "DECOX/USDT", price: 0.0908, change24h: 1.9, volume24h: 9000000, high24h: 0.094, low24h: 0.087 },
};

function normalizeSymbol(value: string | null): string {
  return (value || "BTCUSDT").replace("/", "").toUpperCase();
}

function tickerFor(symbol: string): MarketTicker {
  const fallback = fallbackTickers[symbol] ?? fallbackTickers.BTCUSDT;
  return {
    ...fallback,
    updatedAt: new Date().toISOString(),
    stale: true,
  };
}

function candlesFor(symbol: string, interval: MarketInterval, limit: number): MarketCandle[] {
  const ticker = tickerFor(symbol);
  const count = Math.min(Math.max(limit, 1), 240);
  const now = Date.now();
  const stepMs = interval === "1w" ? 604_800_000 : interval === "1d" ? 86_400_000 : interval === "4h" ? 14_400_000 : interval === "1h" ? 3_600_000 : 300_000;

  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin(index / 3) * ticker.price * 0.012;
    const drift = (index - count / 2) * ticker.price * 0.0004;
    const close = Math.max(ticker.price + wave + drift, ticker.price * 0.01);
    const open = close * (1 + Math.cos(index / 2) * 0.004);
    const high = Math.max(open, close) * 1.006;
    const low = Math.min(open, close) * 0.994;

    return {
      symbol,
      interval,
      timestamp: new Date(now - (count - index) * stepMs).toISOString(),
      open,
      high,
      low,
      close,
      volume: ticker.volume24h / count,
    };
  });
}

function orderBookFor(symbol: string, depth: number): MarketOrderBook {
  const ticker = tickerFor(symbol);
  const levels = Math.min(Math.max(depth, 1), 50);
  const spread = ticker.price * 0.0002;
  const now = new Date().toISOString();

  return {
    symbol,
    updatedAt: now,
    stale: true,
    bids: Array.from({ length: levels }, (_, index) => {
      const amount = Number((0.24 + index * 0.17).toFixed(6));
      const price = ticker.price - spread * (index + 1);
      return { price, amount, total: price * amount };
    }),
    asks: Array.from({ length: levels }, (_, index) => {
      const amount = Number((0.18 + index * 0.14).toFixed(6));
      const price = ticker.price + spread * (index + 1);
      return { price, amount, total: price * amount };
    }),
  };
}

function tradesFor(symbol: string, limit: number): MarketTrade[] {
  const ticker = tickerFor(symbol);
  const count = Math.min(Math.max(limit, 5), 100);
  const now = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const side = index % 2 === 0 ? "buy" : "sell";
    const price = ticker.price * (1 + (side === "buy" ? 1 : -1) * index * 0.00003);
    return {
      id: `MKT-${symbol}-${String(index + 1).padStart(4, "0")}`,
      symbol,
      price,
      amount: Number((0.03 + index * 0.011).toFixed(6)),
      side,
      timestamp: new Date(now - index * 15_000).toISOString(),
    };
  });
}

function fallbackResponse(path: string[] | undefined, req: NextRequest) {
  const section = path?.[0] || "pairs";
  const symbol = normalizeSymbol(req.nextUrl.searchParams.get("symbol"));
  const interval = (req.nextUrl.searchParams.get("interval") || "1d") as MarketInterval;
  const limit = Number(req.nextUrl.searchParams.get("limit") || "120");
  const depth = Number(req.nextUrl.searchParams.get("depth") || "20");

  if (section === "pairs") {
    return NextResponse.json({
      items: fallbackPairs,
      count: fallbackPairs.length,
      source: "fallback",
      updatedAt: new Date().toISOString(),
    });
  }

  if (section === "ticker") {
    return NextResponse.json(tickerFor(symbol));
  }

  if (section === "candles") {
    const items = candlesFor(symbol, interval, limit);
    return NextResponse.json({ items, count: items.length, source: "fallback", updatedAt: new Date().toISOString() });
  }

  if (section === "order-book") {
    return NextResponse.json(orderBookFor(symbol, depth));
  }

  if (section === "trades") {
    const items = tradesFor(symbol, limit);
    return NextResponse.json({ items, count: items.length, source: "fallback", updatedAt: new Date().toISOString() });
  }

  return NextResponse.json({ error: "Market endpoint not found", source: "fallback" }, { status: 404 });
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;

  try {
    const base = getPricingAggregatorBaseUrl();
    const subPath = path?.join("/") || "pairs";
    const url = `${base}/markets/${subPath}${req.nextUrl.search || ""}`;
    const internalAuthToken = getInternalAuthToken();
    const headers: Record<string, string> = {
      "x-internal-auth": internalAuthToken,
    };

    const contentType = req.headers.get("content-type");
    if (contentType) headers["content-type"] = contentType;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(marketBackendTimeoutMs()),
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.text();
      if (body) fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const responseContentType = response.headers.get("content-type") || "";

    if (!responseContentType.includes("application/json")) {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }

    const data = await response.json().catch(() => null);
    if (data === null) {
      return new NextResponse(null, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const detail = error instanceof Error ? error.message : String(error);
      console.warn("[BFF /api/markets] fallback active:", detail);
    }
    return fallbackResponse(path, req);
  }
}

export const GET = handler;
export const POST = handler;
