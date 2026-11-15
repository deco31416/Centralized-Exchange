export const PRICING_AGGREGATOR_CLIENT = 'PRICING_AGGREGATOR_CLIENT';

export interface RemittanceQuoteResult {
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  fxRate: number;
  fee: number;
  quoteId?: string;
}

export interface PricingAggregatorClientPort {
  getQuote(
    amount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<RemittanceQuoteResult>;
}