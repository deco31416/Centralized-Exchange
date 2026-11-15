export interface CreditWalletPayload {
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  reference: string;
  concept: string;
}

export interface CreditWalletResult {
  ledgerEntryId: string;
  status: 'POSTED' | 'PENDING' | 'FAILED';
  postedAt?: string;
  message?: string;
}

export interface WalletLedgerPort {
  creditWallet(payload: CreditWalletPayload): Promise<CreditWalletResult>;
}