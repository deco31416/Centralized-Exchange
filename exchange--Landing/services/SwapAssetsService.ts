import type { SwapAssetsRequest, SwapAssetsResponse } from '@/components/Main/views/1-hero/types';

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

export const getSwapAssets = async (
  params: SwapAssetsRequest,
): Promise<SwapAssetsResponse> => {
  const res = await fetch(
    `/api/prices/convert/${encodeURIComponent(params.from)}/${encodeURIComponent(params.to)}?amount=${params.amount}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`prices/convert failed: ${res.status}`);
  const data: ConversionResult = await res.json();
  return {
    from:   data.from,
    to:     data.to,
    amount: data.amount,
    type:   params.type,
    result: data.converted,
  };
};
