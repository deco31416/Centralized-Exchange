/** Forma interna de la respuesta del aggregator (GET /prices/all) */
interface UnifiedPrice {
  assetCode: string;
  priceUsd: number;
  invertedRate: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  source: 'fiat' | 'crypto' | 'launchpad' | 'stablecoin';
  stale: boolean;
  updatedAt: string;
}

/** Forma interna de la respuesta del aggregator (GET /prices/convert/:from/:to) */
interface ConversionResult {
  from: string;
  to: string;
  rate: number;
  inverseRate: number;
  amount: number;
  converted: number;
  fromPriceUsd: number;
  toPriceUsd: number;
  timestamp: string;
}

export interface Fiat {
    _id:       string;
    base:      string;
    currency:  string;
    __v:       number;
    createdAt: Date;
    rate:      number;
    updatedAt: Date;
    imgUrl:    string;
}

export interface FiatSwapResponse {
  from:   string;
  to:     string;
  amount: number;
  type:   'BUY' | 'SELL';
  result: number;
}

function mapToFiat(up: UnifiedPrice): Fiat {
  return {
    _id:       up.assetCode,
    base:      'USD',
    currency:  up.assetCode,
    __v:       0,
    rate:      up.invertedRate,
    imgUrl:    '',
    createdAt: new Date(up.updatedAt),
    updatedAt: new Date(up.updatedAt),
  };
}

export const getAvailableFiats = async (): Promise<Fiat[]> => {
  const res = await fetch('/api/prices/all', { cache: 'no-store' });
  if (!res.ok) throw new Error(`prices/all failed: ${res.status}`);
  const body = await res.json();
  // Aggregator returns { prices: UnifiedPrice[], count, timestamp } — extract the array
  const data: UnifiedPrice[] = Array.isArray(body) ? body : (body.prices ?? []);
  return data.filter((p) => p.source === 'fiat').map(mapToFiat);
};

/** Alias mantenido para compatibilidad con otros consumidores */
export const getFiatCurrencies = getAvailableFiats;

export const getFiatSwap = async (
  from: string,
  to: string,
  amount: number,
  type: 'BUY' | 'SELL' = 'BUY',
): Promise<FiatSwapResponse> => {
  const res = await fetch(
    `/api/prices/convert/${encodeURIComponent(from)}/${encodeURIComponent(to)}?amount=${amount}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`prices/convert failed: ${res.status}`);
  const data: ConversionResult = await res.json();
  return {
    from:   data.from,
    to:     data.to,
    amount: data.amount,
    type,
    result: data.converted,
  };
};
