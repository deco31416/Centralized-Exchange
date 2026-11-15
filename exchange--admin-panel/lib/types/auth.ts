// Types para autenticación
export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'operator'
  avatar?: string
  permissions?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  user?: AdminUser
  accessToken?: string
  refreshToken?: string
  requiresOtp?: boolean
  sessionId?: string
  debugOtpCode?: string
  error?: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ResetPasswordVerify {
  token: string
  code: string
}

export interface ResetPasswordConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface OtpVerification {
  sessionId: string
  code: string
}

export interface AuthError {
  message: string
  code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'OTP_REQUIRED' | 'SESSION_EXPIRED' | 'UNKNOWN'
  remainingAttempts?: number
  lockoutUntil?: number
}
