export const WALLET_LEDGER_CLIENT = 'WALLET_LEDGER_CLIENT';

export interface WalletSummary {
  walletId: string;
  walletName?: string;
  currency: string;
  balance: number;
  maskedNumber?: string;
}

export interface ReserveBalancePayload {
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
}

export interface ReserveBalanceResult {
  reservationId: string;
  reserved: boolean;
  status: string;
}

export interface CaptureReservationPayload {
  reservationId: string;
  reference: string;
}

export interface CaptureReservationResult {
  captureId: string;
  status: string;
}

export interface CreditBalancePayload {
  userId?: string;
  identifier?: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
}

export interface CreditBalanceResult {
  transactionId: string;
  status: string;
}

export interface ReleaseReservationResult {
  released: boolean;
  status: string;
}

export interface WalletLedgerClientPort {
  getSummary(userId: string): Promise<WalletSummary>;
  reserveBalance(payload: ReserveBalancePayload): Promise<ReserveBalanceResult>;
  captureReservation(
    payload: CaptureReservationPayload,
  ): Promise<CaptureReservationResult>;
  releaseReservation(reservationId: string): Promise<ReleaseReservationResult>;
  creditBalance(payload: CreditBalancePayload): Promise<CreditBalanceResult>;
}