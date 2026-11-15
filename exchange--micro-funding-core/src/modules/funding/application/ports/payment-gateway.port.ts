import type { FundingIntentEntity } from '../../domain/entities/funding-intent.entity';
import type { FundingQuoteEntity } from '../../domain/entities/funding-quote.entity';

/** Código real del método de pago (lowercase), ej: 'card', 'spei', 'oxxo', 'cash_deposit'. */
export type FundingMethod = string;

export interface CreateFundingIntentPayload {
  userId: string;
  walletId: string;
  method: FundingMethod;
  amount: number;
  currency: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface QuoteFundingPayload {
  method: FundingMethod;
  amount: number;
  currency: string;
}

export interface ConfirmFundingPayload {
  intentId: string;
  userId: string;
  walletId: string;
  method: FundingMethod;
  amount: number;
  currency: string;
  sourceId?: string;
  quoteId?: string;
  confirmationCode?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentGatewayConfirmationResult {
  paymentId: string;
  status: 'AUTHORIZED' | 'DECLINED' | 'PENDING';
  message: string;
}

export interface PaymentGatewayPort {
  createFundingIntent(
    payload: CreateFundingIntentPayload,
  ): Promise<FundingIntentEntity>;

  quoteFunding(
    payload: QuoteFundingPayload,
  ): Promise<FundingQuoteEntity>;

  confirmFunding(
    payload: ConfirmFundingPayload,
  ): Promise<PaymentGatewayConfirmationResult>;
}