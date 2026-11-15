export interface FundingQuoteEntity {
  quoteId: string;
  method: string;
  amount: number;
  subtotal: number;
  fee: number;
  tax: number;
  total: number;
  currency: string;
  estimatedSettlementMinutes: number;
  validUntil: string;
}