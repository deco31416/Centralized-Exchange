/**
 * Canal de fondeo tal como lo devuelve asset-registry vía /catalog/assets/grouped.
 * Todos los campos son opcionales para compatibilidad con canales legacy.
 */
export interface FundingChannel {
  mode?: string
  type: string
  displayName?: string
  provider?: string
  bankName?: string
  bankCode?: string
  phone?: string
  documentId?: string
  accountNumberMasked?: string
  accountAlias?: string
  beneficiaryName?: string
  holderName?: string
  instructions?: string
  requiresProofUpload?: boolean
  requiresReferenceNumber?: boolean
  requiresSenderName?: boolean
  requiresSenderDocument?: boolean
  expectedConfirmationMinutes?: number
  minAmount?: number
  maxAmount?: number
  isEnabled?: boolean
  currency?: string
  country?: string
}

export interface ProfileData {
  userId?: string
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  phone?: string
  status?: string
  country?: string
  createdAt?: string
  avatarUrl?: string
}

export interface WalletBalance {
  currency: string
  available: number
  locked: number
  type: "fiat" | "crypto"
}

export interface WalletData {
  accountNumber?: string
  balances?: WalletBalance[]
}

export interface SessionInfo {
  sessionId: string
  device?: string
  ip?: string
  lastUsed?: string
  current?: boolean
  userAgent?: string
  createdAt?: string
}

export interface SignatureStatus {
  hasSignature?: boolean
  hasPIN?: boolean
  isActive?: boolean
  isLocked?: boolean
  pinLength?: number
  lastChangedAt?: string
  pinCreatedAt?: string
  dynamicKeyEnabled?: boolean
  lastActivity?: string
}

export interface DynamicKeyStatus {
  enabled?: boolean
  key?: string
  expiresAt?: string
  remainingSeconds?: number
}

export interface Movement {
  _id: string
  id?: string
  type: string
  amount: number
  currency: string
  status: string
  description?: string
  concept?: string
  direction?: "in" | "out" | "credit" | "debit"
  createdAt: string
}
