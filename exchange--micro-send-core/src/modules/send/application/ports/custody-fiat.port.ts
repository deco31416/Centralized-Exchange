type BankPayload = {
  userId: string;
  bankCode: string;
  accountNumber: string;
  beneficiaryName: string;
  accountType?: string;
  amount: number;
  currency: string;
  sourceWalletId?: string;
  reference?: string;
  otpCode?: string;
};

type SpeiPayload = {
  userId: string;
  bankCode: string;
  clabe: string;
  beneficiaryName: string;
  concept?: string;
  amount: number;
  currency: string;
  sourceWalletId?: string;
  reference?: string;
  otpCode?: string;
};

export interface CustodyFiatPort {
  quoteBank(payload: BankPayload): Promise<{
    fee: number;
    totalDebit: number;
    estimatedDelivery: string;
  }>;

  executeBank(payload: BankPayload): Promise<{
    operationId: string;
    providerReference: string;
    executedAt: string;
    message: string;
  }>;

  quoteSpei(payload: SpeiPayload): Promise<{
    fee: number;
    totalDebit: number;
    estimatedDelivery: string;
  }>;

  executeSpei(payload: SpeiPayload): Promise<{
    operationId: string;
    providerReference: string;
    executedAt: string;
    message: string;
  }>;
}