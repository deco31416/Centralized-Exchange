/**
 * Response DTO for swap quote.
 */
export class SwapQuoteResponseDto {
  quoteId: string;
  fromAsset: string;
  fromAmount: number;
  toAsset: string;
  toAmount: number;
  rate: number;
  spread: number;
  pricingBand: string;
  expiresAt: Date;
}

/**
 * Response DTO for executed swap.
 */
export class SwapExecutionResponseDto {
  swapId: string;
  status: string;
  fromAsset: string;
  fromAmount: number;
  toAsset: string;
  toAmount: number;
  executedRate: number;
  spread: number;
  pricingBand: string;
  executedAt: Date;
  ledgerEntryId: string;
}
