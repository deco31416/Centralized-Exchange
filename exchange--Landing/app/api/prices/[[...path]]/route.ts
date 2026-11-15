import { NextRequest, NextResponse } from 'next/server';
import { getPricingAggregatorBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';

export const dynamic = 'force-dynamic';

type PriceSource = 'fiat' | 'crypto' | 'launchpad' | 'stablecoin';

type FallbackPrice = {
  assetCode: string;
  priceUsd: number;
  invertedRate: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  source: PriceSource;
  stale: boolean;
  updatedAt: string;
};

const fallbackPrices: Omit<FallbackPrice, 'updatedAt'>[] = [
  { assetCode: 'USD', priceUsd: 1, invertedRate: 1, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'COP', priceUsd: 0.00025, invertedRate: 4000, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'EUR', priceUsd: 1.08, invertedRate: 0.9259, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'MXN', priceUsd: 0.054054, invertedRate: 18.5, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'CLP', priceUsd: 0.00105263, invertedRate: 950, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'PEN', priceUsd: 0.266667, invertedRate: 3.75, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'ARS', priceUsd: 0.00090909, invertedRate: 1100, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'VES', priceUsd: 0.0273973, invertedRate: 36.5, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'AWG', priceUsd: 0.558659, invertedRate: 1.79, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'DOP', priceUsd: 0.0169492, invertedRate: 59, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'BRL', priceUsd: 0.192308, invertedRate: 5.2, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'fiat', stale: true },
  { assetCode: 'BTC', priceUsd: 65000, invertedRate: 0.00001538, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'crypto', stale: true },
  { assetCode: 'ETH', priceUsd: 3500, invertedRate: 0.00028571, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'crypto', stale: true },
  { assetCode: 'BNB', priceUsd: 600, invertedRate: 0.00166667, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'crypto', stale: true },
  { assetCode: 'SOL', priceUsd: 150, invertedRate: 0.00666667, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'crypto', stale: true },
  { assetCode: 'USDT', priceUsd: 1, invertedRate: 1, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'stablecoin', stale: true },
  { assetCode: 'USDC', priceUsd: 1, invertedRate: 1, priceChange24h: 0, volume24h: 0, marketCap: 0, source: 'stablecoin', stale: true },
];

function getFallbackPrices(): FallbackPrice[] {
  const updatedAt = new Date().toISOString();
  return fallbackPrices.map((price) => ({ ...price, updatedAt }));
}

function fallbackConvert(path: string[], searchParams: URLSearchParams) {
  const [, fromRaw, toRaw] = path;
  const from = fromRaw?.toUpperCase();
  const to = toRaw?.toUpperCase();
  const amount = Number(searchParams.get('amount') || '1');
  const prices = getFallbackPrices();
  const fromPrice = prices.find((price) => price.assetCode === from);
  const toPrice = prices.find((price) => price.assetCode === to);

  if (!from || !to || !fromPrice || !toPrice || Number.isNaN(amount)) {
    return NextResponse.json(
      { error: 'pricing-aggregator unavailable', fallback: true },
      { status: 503 },
    );
  }

  const rate = fromPrice.priceUsd / toPrice.priceUsd;
  const converted = amount * rate;

  return NextResponse.json({
    from,
    to,
    rate,
    inverseRate: rate ? 1 / rate : 0,
    amount,
    converted,
    fromPriceUsd: fromPrice.priceUsd,
    toPriceUsd: toPrice.priceUsd,
    timestamp: new Date().toISOString(),
    stale: true,
    fallback: true,
  });
}

function fallbackResponse(path?: string[]) {
  const subPath = path || [];

  if (subPath[0] === 'all' || subPath.length === 0) {
    const prices = getFallbackPrices();
    return NextResponse.json({
      prices,
      count: prices.length,
      timestamp: new Date().toISOString(),
      stale: true,
      fallback: true,
    });
  }

  if (subPath[0] === 'convert') {
    return fallbackConvert(subPath, new URLSearchParams());
  }

  return NextResponse.json(
    { error: 'pricing-aggregator unavailable', fallback: true },
    { status: 503 },
  );
}

/**
 * Proxy server-side a pricing-aggregator (:3013).
 * NO va por gateway-user (acceso directo desde BFF, según arquitectura DECOX).
 *
 * Uso típico:
 *   GET /api/prices/convert/MXN/USD?amount=20000
 *   GET /api/prices/quote?from=BTC&to=MXN&amount=0.05
 */
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const { path } = await context.params;
    const base = getPricingAggregatorBaseUrl();
    const subPath = path?.join('/') || '';
    const queryString = req.nextUrl.search || '';
    const url = `${base}/prices${subPath ? `/${subPath}` : ''}${queryString}`;
    const internalAuthToken = getInternalAuthToken();

    const headers: Record<string, string> = {
      'x-internal-auth': internalAuthToken,
    };
    const contentType = req.headers.get('content-type');
    if (contentType) headers['content-type'] = contentType;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const responseContentType = response.headers.get('content-type') || '';

    if (!responseContentType.includes('application/json')) {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
    const data = await response.json().catch(() => null);
    if (data === null) {
      return new NextResponse(null, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const { path } = await context.params;
    console.warn('[BFF /api/prices] pricing-aggregator unavailable, using fallback:', error);

    if (path?.[0] === 'convert') {
      return fallbackConvert(path, req.nextUrl.searchParams);
    }

    return fallbackResponse(path);
  }
}

export const GET = handler;
export const POST = handler;
