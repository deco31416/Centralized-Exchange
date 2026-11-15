export interface RedeemQuoteInterface {
  quoteId: string;
  rate: number;
  fee: number;
  sourceAmount: number;
  targetAmount: number;
  expiresAt: string;
}