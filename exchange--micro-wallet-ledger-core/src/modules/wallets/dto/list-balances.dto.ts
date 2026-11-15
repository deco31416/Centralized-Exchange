export interface WalletBalanceResponse {
  walletId: string;
  accountId: string;
  accountNumber?: string;
  currency: string;
  availableMinorUnits: string;
  lockedMinorUnits: string;
  availableFormatted: string;
  lockedFormatted: string;
  status: string;
}

export interface UserBalancesResponse {
  userId: string;
  accountId: string;
  accountNumber?: string;
  balances: WalletBalanceResponse[];
  totalBalancesCount: number;
}
