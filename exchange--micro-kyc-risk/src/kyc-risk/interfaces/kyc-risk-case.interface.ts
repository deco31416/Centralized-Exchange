export type KycRiskCaseType = 'kyc' | 'aml' | 'risk' | 'manual_review';
export type KycRiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type KycRiskStatus = 'open' | 'in_review' | 'approved' | 'rejected' | 'escalated' | 'closed';
export type UserRiskLevel = 'green' | 'orange' | 'red';
export type UserRiskSignalSource =
  | 'kyc'
  | 'transaction_behavior'
  | 'external_osint'
  | 'security_event'
  | 'blockchain_analytics'
  | 'manual_review';

export interface KycRiskCase {
  caseId: string;
  userId: string;
  type: KycRiskCaseType;
  severity: KycRiskSeverity;
  status: KycRiskStatus;
  reason: string;
  notes?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycRiskRule {
  code: string;
  name: string;
  category: KycRiskCaseType;
  severity: KycRiskSeverity;
  description: string;
  enabled: boolean;
}

export interface UserRiskSignal {
  source: UserRiskSignalSource;
  label: string;
  scoreImpact: number;
  severity: KycRiskSeverity;
  observedAt: string;
}

export interface UserRiskProfile {
  userId: string;
  kycLevel: 'none' | 'level_1' | 'level_2' | 'level_3' | 'institutional';
  riskScore: number;
  riskLevel: UserRiskLevel;
  status: 'active' | 'monitoring' | 'restricted' | 'blocked';
  reason: string;
  signals: UserRiskSignal[];
  lastAssessmentAt: string;
  updatedAt: string;
}
