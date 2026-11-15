export interface SavingCreatedEvent {
  savingId: string;
  userId: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface SavingContributionEvent {
  savingId: string;
  userId: string;
  amount: number;
  currency: string;
  contributedAt: string;
}

export interface SavingWithdrawalEvent {
  savingId: string;
  userId: string;
  amount: number;
  currency: string;
  withdrawnAt: string;
}