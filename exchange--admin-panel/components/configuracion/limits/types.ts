export type LimitDecision = "ALLOW" | "REVIEW" | "BLOCK"

export type LimitPolicyRule = {
  id: string
  name: string
  scope: string
  operation: string
  assetType: string
  product: string
  country?: string
  currency?: string
  kycLevel: string
  riskLevel: string
  minAmount: number
  maxAmount: number
  dailyLimit: number
  monthlyLimit: number
  requiresApproval: boolean
  enabled: boolean
  priority: number
  version: number
  source: string
  lastChangedBy?: string
  lastChangeReason?: string
  updatedAt: string
}

export type LimitsOverview = {
  totalRules: number
  enabledRules: number
  approvalRules: number
  fiatRules: number
  cryptoRules: number
  riskRules: number
  pendingRequests?: number
  source: string
  updatedAt: string
  nextStep?: string
}

export type LimitPolicyChange = {
  id: string
  ruleId: string
  version: number
  action: "UPDATE"
  changedBy: string
  reason: string
  before: LimitPolicyRule
  after: LimitPolicyRule
  createdAt: string
}

export type LimitPolicyRequestStatus = "PENDING" | "APPROVED" | "REJECTED"

export type LimitPolicyChangeRequest = {
  id: string
  ruleId: string
  action: "UPDATE"
  status: LimitPolicyRequestStatus
  requestedBy: string
  requestReason: string
  patch: Partial<LimitPolicyRule>
  before: LimitPolicyRule
  reviewedBy?: string
  reviewReason?: string
  appliedChangeId?: string
  createdAt: string
  reviewedAt?: string
}

export type LimitEvaluation = {
  decision: LimitDecision
  allowed: boolean
  requiresApproval: boolean
  rule: LimitPolicyRule | null
  reasons: string[]
  auditRequired: boolean
  evaluatedAt: string
}
