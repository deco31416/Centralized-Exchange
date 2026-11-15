export type PointType = 'cashier' | 'commerce' | 'company' | 'liquidity_desk';

export type PointStatus =
  | 'draft'
  | 'submitted'
  | 'kyc_review'
  | 'kyb_review'
  | 'risk_review'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'revoked';

export type PointService =
  | 'cash_in'
  | 'cash_out'
  | 'remittance'
  | 'fiat_exchange'
  | 'stablecoin_exchange';

export type PointOrderStatus =
  | 'quoted'
  | 'created'
  | 'accepted'
  | 'rate_locked'
  | 'location_revealed'
  | 'user_checked_in'
  | 'code_verified'
  | 'cash_received'
  | 'cash_delivered'
  | 'settlement_pending'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'disputed';

export type RiskLevel = 'green' | 'orange' | 'red' | 'review';

export interface PointQuoteInput {
  type?: PointService;
  country?: string;
  originCurrency?: string;
  destinationCurrency?: string;
  amountOrigin?: number | string;
  userKycLevel?: string;
  userRiskLevel?: RiskLevel;
}

export interface PointOrderActionInput {
  actorId?: string;
  actorRole?: 'user' | 'point_operator' | 'admin' | 'system' | 'microservice';
  reason?: string;
  note?: string;
  code?: string;
  geofenceProof?: string;
  resolution?: 'refund_user' | 'release_to_point' | 'cancel_order' | 'manual_review' | 'no_action';
  evidenceRefs?: string[];
}
