export interface FundingConfirmationEntity {
  fundingId: string;
  intentId: string;
  paymentId: string;
  ledgerEntryId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  creditedAmount: number;
  currency: string;
  processedAt: string;
  message: string;
}