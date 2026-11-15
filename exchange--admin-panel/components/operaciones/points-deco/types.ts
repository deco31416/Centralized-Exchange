export type PointService =
  | "cash_in"
  | "cash_out"
  | "remittance"
  | "fiat_exchange"
  | "stablecoin_exchange"

export type PointStatus =
  | "draft"
  | "submitted"
  | "kyc_review"
  | "kyb_review"
  | "risk_review"
  | "approved"
  | "active"
  | "suspended"
  | "revoked"

export type DecoPoint = {
  id: string
  type: "cashier" | "commerce" | "company" | "liquidity_desk"
  tradeName: string
  legalName?: string
  country: string
  region?: string
  city: string
  zone: string
  status: PointStatus
  riskLevel?: "green" | "orange" | "red" | "review"
  kybLevel?: string
  allowedServices: PointService[]
  liquidityRangeLabel: string
  scheduleLabel: string
  rating?: number
}

export type PointOrder = {
  id: string
  type: PointService
  userId: string
  pointId?: string
  originCurrency: string
  destinationCurrency: string
  amountOrigin: number
  amountDestinationEstimated: number
  rate: number
  decoFee: number
  pointFee: number
  status: string
  rateLockedUntil?: string
  createdAt?: string
}

export type PointDispute = {
  id: string
  orderId: string
  pointId?: string
  userId?: string
  orderType?: PointService
  originCurrency?: string
  destinationCurrency?: string
  amountOrigin?: number
  amountDestinationEstimated?: number
  openedBy?: string
  openedByRole?: string
  status: string
  reason?: string
  assignedTo?: string
  resolution?: string
  resolutionReason?: string
  makerCheckerStatus?: "not_required" | "pending_checker" | "approved" | "rejected"
  preparedBy?: string
  preparedAt?: string
  checkedBy?: string
  checkedAt?: string
  checkerNote?: string
  appliedResolutionAt?: string
  resolutionExecutionStatus?:
    | "not_started"
    | "queued_for_executor"
    | "executed_noop"
    | "executed_cancelled"
    | "executed_refunded"
    | "executed_released_to_point"
    | "failed_review_required"
    | "blocked"
  resolutionExecutionPlan?: string
  resolutionExecutionId?: string
  executedBy?: string
  executedAt?: string
  executionNote?: string
  auditTrail?: Array<Record<string, unknown>>
  openedAt?: string
  reviewStartedAt?: string
  resolvedAt?: string
  rejectedAt?: string
  slaDueAt?: string
  createdAt?: string
}

export type PointCashCurrencySummary = {
  currency: string
  positions: number
  balanceMinorUnits: string
  cashInMinorUnits: string
  cashOutMinorUnits: string
  neutralMovements: number
}

export type PointCashSummary = {
  positions: number
  movements: number
  currencies: PointCashCurrencySummary[]
  review?: {
    manualOrCloseMovements: number
    nextAction: string
  }
  updatedAt: string
}

export type PointCashMovement = {
  id: string
  pointId: string
  currency: string
  type: string
  direction: "in" | "out" | "neutral"
  amountMinorUnits: string
  balanceBeforeMinorUnits: string
  balanceAfterMinorUnits: string
  orderId?: string
  reason?: string
  createdAt?: string
}

export type PointReceipt = {
  id: string
  orderId: string
  pointId?: string
  type: PointService
  status: "draft" | "final" | "review_required"
  orderStatus: string
  userId: string
  evidence: {
    cashMovements: number
    auditTrailEvents: number
    reconciliationState: string
  }
  generatedAt: string
}

export type PointSettlement = {
  id: string
  orderId: string
  pointId?: string
  type: PointService
  status: "balanced" | "review_required"
  originCurrency: string
  destinationCurrency: string
  originDifferenceMinorUnits: string
  destinationDifferenceMinorUnits: string
  ledgerStatus: string
  approvalStatus: "not_required" | "pending_admin_review"
  reviewReasons: string[]
  fiscalReportStatus: "draft" | "ready_for_export"
  generatedAt?: string
}

export type PointEconomicAction = {
  id: string
  disputeId: string
  orderId: string
  pointId?: string
  userId?: string
  resolution: "refund_user" | "release_to_point"
  actionType: "non_hold_refund" | "non_hold_point_payout"
  status: "pending_review" | "queued_for_custody" | "executed" | "rejected"
  requiredAction: string
  reason: string
  sourceExecutionId?: string
  orderStatus?: string
  ledgerHoldStatus?: string
  requiresLedgerHold?: boolean
  originCurrency?: string
  destinationCurrency?: string
  amountOrigin?: number
  amountDestinationEstimated?: number
  createdBy?: string
  createdByRole?: string
  createdAtIso?: string
  reviewedBy?: string
  reviewedByRole?: string
  reviewedAtIso?: string
  executedBy?: string
  executedByRole?: string
  executedAtIso?: string
  rejectedBy?: string
  rejectedByRole?: string
  rejectedAtIso?: string
  rejectionReason?: string
  executionReference?: string
  auditTrail?: Array<Record<string, unknown>>
}

export type PointFiatSettlementIntent = {
  id: string
  actionId: string
  orderId: string
  pointId: string
  currency: string
  amountMinorUnits: string
  status:
    | "intent_registered"
    | "provider_pending"
    | "provider_dispatched"
    | "provider_settled"
    | "provider_failed"
    | "manual_review_required"
  providerHint: string
  providerMode: "not_dispatched" | "manual" | "automatic"
  reason?: string
  correlationId?: string
  createdAtIso?: string
  dispatchedAtIso?: string
  dispatchedBy?: string
  dispatchReference?: string
  settledAtIso?: string
  settledBy?: string
  settlementReference?: string
  settlementEvidenceRefs?: string[]
  bankReconciliation?: Record<string, unknown>
  auditTrail?: Array<Record<string, unknown>>
}

export type PointFiscalReportRow = {
  settlementId: string
  orderId: string
  pointId: string
  type: PointService
  status: "balanced" | "review_required"
  originCurrency: string
  expectedOriginMinorUnits: string
  actualReceivedMinorUnits: string
  originDifferenceMinorUnits: string
  destinationCurrency: string
  expectedDestinationMinorUnits: string
  actualDeliveredMinorUnits: string
  destinationDifferenceMinorUnits: string
  ledgerStatus: string
  approvalStatus: string
  fiscalReportStatus: "draft" | "ready_for_export"
  reviewReasons: string
  completedAt: string
  generatedAt: string
}

export type PointFiscalReport = {
  summary: {
    settlements: number
    readyForExport: number
    reviewRequired: number
    balanced: number
    originDifferenceMinorUnits: string
    destinationDifferenceMinorUnits: string
  }
  filters: {
    pointId?: string
    orderId?: string
    status?: string
    fiscalReportStatus?: string
    limit?: string
  }
  items: PointFiscalReportRow[]
  source: string
  generatedAt: string
}

export type PointMonthlyReportRow = {
  month: string
  pointId: string
  originCurrency: string
  destinationCurrency: string
  settlements: number
  balanced: number
  reviewRequired: number
  readyForExport: number
  expectedOriginMinorUnits: string
  actualReceivedMinorUnits: string
  originDifferenceMinorUnits: string
  expectedDestinationMinorUnits: string
  actualDeliveredMinorUnits: string
  destinationDifferenceMinorUnits: string
}

export type PointMonthlyReport = {
  summary: {
    groups: number
    settlements: number
    readyForExport: number
    reviewRequired: number
  }
  filters: {
    pointId?: string
    orderId?: string
    status?: string
    fiscalReportStatus?: string
    month?: string
    limit?: string
  }
  items: PointMonthlyReportRow[]
  source: string
  generatedAt: string
}

export type PointAuditExport = {
  summary: {
    orders: number
    points: number
    cashMovements: number
    settlements: number
    disputes: number
    economicActions: number
    reviewRequired: number
  }
  filters: {
    pointId?: string
    orderId?: string
    status?: string
    fiscalReportStatus?: string
    month?: string
    limit?: string
  }
  items: Array<Record<string, string>>
  source: string
  generatedAt: string
}

export type PointSecureForm = {
  id: string
  type:
    | "source_of_funds"
    | "identity_support"
    | "fiscal_support"
    | "dispute_support"
    | "provider_evidence"
  status: "submitted" | "reviewing" | "approved" | "rejected" | "expired"
  orderId?: string
  pointId?: string
  userId?: string
  submittedBy: string
  submittedByRole: string
  consentAccepted: boolean
  fields?: Record<string, unknown>
  evidenceRefs?: string[]
  expiresAt?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
  createdAtIso?: string
}

export type PointsDecoOverview = {
  totalPoints: number
  activePoints: number
  commercePoints: number
  cashierPoints: number
  openOrders: number
  disputedOrders: number
  line: string
  complements: string[]
  source: string
  updatedAt: string
  nextStep: string
}
