export interface FundingMethodEntity {
  code: string;
  methodCode?: string;
  name: string;
  description: string;
  fiatCode?: string;
  currency: string;
  country?: string;
  type?:
    | 'CARD'
    | 'BANK_TRANSFER'
    | 'CASH'
    | 'INTERNAL_BALANCE'
    | 'SPEI'
    | 'PIX'
    | 'PIX_STRIPE'       // PIX procesado directamente por Stripe
    | 'SEPA'             // SEPA transferencia manual
    | 'SEPA_DEBIT'       // SEPA Direct Debit vía Stripe
    | 'ACH'              // ACH manual
    | 'ACH_DEBIT'        // ACH Direct Debit vía Stripe (us_bank_account)
    | 'OXXO'             // Voucher OXXO vía Stripe (MXN)
    | 'BOLETO'           // Boleto Bancário vía Stripe (BRL)
    | 'IDEAL'            // iDEAL vía Stripe (EUR/NL)
    | 'WIRE'
    | 'PAYMENT_APP'
    | 'MOBILE_PAYMENT'
    | 'INTERNAL_DEPOSIT'
    | 'OTHER';
  minAmount: number;
  maxAmount: number;
  requiresSavedCard: boolean;
  requiresKyc?: boolean;
  settlementTime?: string;
  instructions?: string;
  iconUrl?: string;
  isInternal?: boolean;
  isManualDeposit?: boolean;
  adminEditable?: boolean;
  displayOrder?: number;
  enabled: boolean;
  disabledReason?: string;
  metadata?: Record<string, unknown>;
}