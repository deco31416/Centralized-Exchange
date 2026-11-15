type DECOPAYload = {
  userId: string;
  destinationUserId: string;
  amount: number;
  currency: string;
  sourceWalletId?: string;
  reference?: string;
  otpCode?: string;
};

type WalletPayload = {
  userId: string;
  destinationWalletId: string;
  amount: number;
  currency: string;
  sourceWalletId?: string;
  reference?: string;
  otpCode?: string;
};

export interface InternalTransfersPort {
  quotedeco(payload: DECOPAYload): Promise<{
    fee: number;
    totalDebit: number;
    estimatedDelivery: string;
  }>;

  executedeco(payload: DECOPAYload): Promise<{
    operationId: string;
    providerReference: string;
    executedAt: string;
    message: string;
  }>;

  quoteWallet(payload: WalletPayload): Promise<{
    fee: number;
    totalDebit: number;
    estimatedDelivery: string;
  }>;

  executeWallet(payload: WalletPayload): Promise<{
    operationId: string;
    providerReference: string;
    executedAt: string;
    message: string;
  }>;
}