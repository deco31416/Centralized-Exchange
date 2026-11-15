// Enums compartidos del dominio P2P

export enum AdSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum AdStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ESCROW_NOT_AVAILABLE = 'ESCROW_NOT_AVAILABLE',
}

export enum PriceType {
  FIXED = 'FIXED',
  FLOATING = 'FLOATING',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  ESCROW_PENDING = 'ESCROW_PENDING',
  ESCROW_LOCKED = 'ESCROW_LOCKED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_MARKED = 'PAYMENT_MARKED',
  RELEASE_PENDING = 'RELEASE_PENDING',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  EXPIRED = 'EXPIRED',
  ESCROW_NOT_AVAILABLE = 'ESCROW_NOT_AVAILABLE',
}

export enum PaymentStatus {
  NOT_PAID = 'NOT_PAID',
  MARKED_PAID = 'MARKED_PAID',
  CONFIRMED_RECEIVED = 'CONFIRMED_RECEIVED',
  REJECTED = 'REJECTED',
}

export enum EscrowStatus {
  PENDING = 'PENDING',
  LOCKED = 'LOCKED',
  RELEASE_PENDING = 'RELEASE_PENDING',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export enum PaymentMethodType {
  BANK = 'BANK',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export enum PaymentMethodStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

/**
 * Rail de pago de una orden P2P.
 *
 * EXTERNAL_FIAT_PAYMENT — el comprador paga fiat directamente al vendedor fuera de BlackCEX
 *   (transferencia bancaria, SPEI, Nequi, etc.). El sistema no mueve fiat.
 *   Buyer marca paid → seller confirma → release crypto.
 *
 * INTERNAL_FIAT_WALLET — el comprador usa su saldo fiat interno de BlackCEX Wallet.
 *   ⛔ BLOQUEADO hasta que wallet-ledger implemente holds/locks reales.
 *   Ver P2P-FIAT-HOLD-INTEGRATION-001.
 */
export enum PaymentRail {
  EXTERNAL_FIAT_PAYMENT = 'EXTERNAL_FIAT_PAYMENT',
  INTERNAL_FIAT_WALLET = 'INTERNAL_FIAT_WALLET',
}

/**
 * Estado del settlement fiat interno en una orden P2P.
 * Solo aplica cuando paymentRail = INTERNAL_FIAT_WALLET.
 * Para EXTERNAL_FIAT_PAYMENT siempre es NOT_APPLICABLE.
 */
export enum FiatSettlementStatus {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  FIAT_HOLD_PENDING = 'FIAT_HOLD_PENDING',
  FIAT_LOCKED = 'FIAT_LOCKED',
  FIAT_RELEASE_PENDING = 'FIAT_RELEASE_PENDING',
  FIAT_RELEASED = 'FIAT_RELEASED',
  FIAT_REFUNDED = 'FIAT_REFUNDED',
  FIAT_FAILED = 'FIAT_FAILED',
}
