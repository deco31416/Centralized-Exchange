export type LimitOperation =
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'BUY'
  | 'SELL'
  | 'CONVERT'
  | 'P2P'
  | 'REMITTANCE'
  | 'PAYMENT'
  | 'TRANSFER';

export type LimitAssetType = 'FIAT' | 'CRYPTO' | 'ANY';

export type LimitScope =
  | 'GLOBAL'
  | 'COUNTRY'
  | 'CURRENCY'
  | 'PRODUCT'
  | 'KYC_LEVEL'
  | 'RISK_LEVEL';

export type KycLevel = 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'INSTITUTIONAL' | 'ANY';

export type RiskLevel = 'GREEN' | 'ORANGE' | 'RED' | 'ANY';

export type LimitDecision = 'ALLOW' | 'REVIEW' | 'BLOCK';

export type LimitPolicySource = 'bootstrap' | 'admin';
export type LimitPolicyRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LimitPolicyRule = {
  id: string;
  name: string;
  scope: LimitScope;
  operation: LimitOperation;
  assetType: LimitAssetType;
  product: string;
  country?: string;
  currency?: string;
  kycLevel: KycLevel;
  riskLevel: RiskLevel;
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  requiresApproval: boolean;
  enabled: boolean;
  priority: number;
  version: number;
  source: LimitPolicySource;
  lastChangedBy?: string;
  lastChangeReason?: string;
  updatedAt: string;
};

export type LimitEvaluationInput = {
  operation?: string;
  assetType?: string;
  product?: string;
  country?: string;
  currency?: string;
  kycLevel?: string;
  riskLevel?: string;
  amount?: string;
};

export type LimitPrecheckInput = Omit<LimitEvaluationInput, 'amount'> & {
  amount?: string | number;
  userId?: string;
  operationId?: string;
  idempotencyKey?: string;
  sourceService?: string;
  requestedBy?: string;
  dailyUsed?: string | number;
  monthlyUsed?: string | number;
  availableBalance?: string | number;
  custodyAvailable?: string | number;
  custodyProviderStatus?: string;
  riskScore?: string | number;
  metadata?: Record<string, unknown>;
};

export type UpdateLimitPolicyRuleInput = {
  reason?: string;
  changedBy?: string;
  enabled?: boolean;
  requiresApproval?: boolean;
  minAmount?: number;
  maxAmount?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  priority?: number;
};

export type ReviewLimitPolicyRequestInput = {
  reason?: string;
  reviewedBy?: string;
};

export type LimitPolicyChange = {
  id: string;
  ruleId: string;
  version: number;
  action: 'UPDATE';
  changedBy: string;
  reason: string;
  before: LimitPolicyRule;
  after: LimitPolicyRule;
  createdAt: string;
};

export type LimitPolicyChangeRequest = {
  id: string;
  ruleId: string;
  action: 'UPDATE';
  status: LimitPolicyRequestStatus;
  requestedBy: string;
  requestReason: string;
  patch: Partial<LimitPolicyRule>;
  before: LimitPolicyRule;
  reviewedBy?: string;
  reviewReason?: string;
  appliedChangeId?: string;
  createdAt: string;
  reviewedAt?: string;
};
