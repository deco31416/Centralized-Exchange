import { CryptoPriceData } from '@/types/crypto-price-data';

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

export interface CryptoSwapResponse {
  from:   string;
  to:     string;
  amount: number;
  type:   'BUY' | 'SELL';
  result: number;
}

function mapToCryptoPriceData(up: UnifiedPrice): CryptoPriceData {
  return {
    _id:              up.assetCode,
    symbol:           up.assetCode,
    name:             up.assetCode,
    averagePrice:     up.priceUsd,
    averageChange24h: up.priceChange24h,
    averageVolume24h: up.volume24h,
    prices: {
      cryptoCompare:  up.priceUsd,
      coinGecko:      up.priceUsd,
      coinMarketCap:  up.priceUsd,
    },
    createdAt: up.updatedAt,
    updatedAt: up.updatedAt,
    __v:       0,
    imgUrl:    '',
  };
}

async function fetchAllPrices(): Promise<UnifiedPrice[]> {
  const res = await fetch('/api/prices/all', { cache: 'no-store' });
  if (!res.ok) throw new Error(`prices/all failed: ${res.status}`);
  const body = await res.json();
  // Aggregator returns { prices: UnifiedPrice[], count, timestamp } — extract the array
  return Array.isArray(body) ? body : (body.prices ?? []);
}

export const getCryptoCurrencies = async (includeStablecoins: boolean = false): Promise<CryptoPriceData[]> => {
  const all = await fetchAllPrices();
  return all
    .filter((p) => p.source === 'crypto' || p.source === 'launchpad' || (includeStablecoins && p.source === 'stablecoin'))
    .map(mapToCryptoPriceData);
};

export const getStablecoins = async (): Promise<CryptoPriceData[]> => {
  const all = await fetchAllPrices();
  return all.filter((p) => p.source === 'stablecoin').map(mapToCryptoPriceData);
};

export const getCryptoBySymbols = async (symbols: string[]): Promise<CryptoPriceData[]> => {
  const all = await fetchAllPrices();
  const set = new Set(symbols.map((s) => s.toUpperCase()));
  return all.filter((p) => set.has(p.assetCode.toUpperCase())).map(mapToCryptoPriceData);
};

export const getRandomCryptos = async (limit: number = 10, includeStablecoins: boolean = false): Promise<CryptoPriceData[]> => {
  const all = await getCryptoCurrencies(includeStablecoins);
  return all.sort(() => Math.random() - 0.5).slice(0, limit);
};

export const getLosers = async (): Promise<CryptoPriceData[]> => {
  const all = await getCryptoCurrencies(false);
  return all.sort((a, b) => a.averageChange24h - b.averageChange24h).slice(0, 4);
};

export const getGainers = async (): Promise<CryptoPriceData[]> => {
  const all = await getCryptoCurrencies(false);
  return all.sort((a, b) => b.averageChange24h - a.averageChange24h).slice(0, 4);
};

export interface MarketStats {
  /** Suma de marketCap de todos los activos crypto + stablecoin en USD */
  totalMarketCapUsd: number;
  /** Suma de volume24h de todos los activos crypto + stablecoin en USD */
  totalVolume24hUsd: number;
  /** Dominancia BTC (%) respecto al totalMarketCapUsd */
  btcDominance: number;
  /** Dominancia ETH (%) respecto al totalMarketCapUsd */
  ethDominance: number;
}

/**
 * Deriva métricas globales de mercado sumando los datos por activo del aggregator.
 * Fuente: mismo endpoint /api/prices/all ya usado por Trending/Gainers/Losers.
 * No incluye launchpad (tokens internos) ni fiat en el cómputo global.
 */
export async function getMarketStats(): Promise<MarketStats> {
  const all = await fetchAllPrices();
  const relevant = all.filter(
    (p) => p.source === 'crypto' || p.source === 'stablecoin',
  );
  const totalMarketCapUsd = relevant.reduce((s, p) => s + (p.marketCap ?? 0), 0);
  const totalVolume24hUsd = relevant.reduce((s, p) => s + (p.volume24h ?? 0), 0);
  const btc = relevant.find((p) => p.assetCode.toUpperCase() === 'BTC');
  const eth = relevant.find((p) => p.assetCode.toUpperCase() === 'ETH');
  const btcDominance =
    totalMarketCapUsd > 0 && btc ? (btc.marketCap / totalMarketCapUsd) * 100 : 0;
  const ethDominance =
    totalMarketCapUsd > 0 && eth ? (eth.marketCap / totalMarketCapUsd) * 100 : 0;
  return { totalMarketCapUsd, totalVolume24hUsd, btcDominance, ethDominance };
}

export const getCryptoSwap = async (
  from: string,
  to: string,
  amount: number,
  type: 'BUY' | 'SELL' = 'BUY',
): Promise<CryptoSwapResponse> => {
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
