export interface FundingIntentEntity {
  intentId: string;
  reference: string;
  userId: string;
  walletId: string;
  method: string;
  amount: number;
  currency: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  expiresAt: string;
  metadata?: Record<string, unknown>;
}