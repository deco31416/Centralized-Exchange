import { Types } from 'mongoose';

export type ObjectIdType = Types.ObjectId;

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted',
}

export enum CredentialType {
  PASSWORD = 'password',
  WEBAUTHN = 'webauthn',
  OAUTH_EXTERNAL = 'oauth_external',
}

export enum MfaType {
  TOTP = 'totp',
  WEBAUTHN = 'webauthn',
}

export enum TokenPurpose {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
  MAGIC_LINK = 'magic_link',
}

export interface HashedToken {
  readonly hash: string;
  readonly salt: string;
}

export interface JwtPayload {
  readonly sub: string;
  readonly iss?: string; // Optional - set by JWT library via issuer option
  readonly aud: string;
  readonly exp: number;
  readonly iat: number;
  readonly nbf: number;
  readonly jti: string;
  readonly scope: string;
  readonly amr?: string[];
  readonly acr?: string;
  readonly sid?: string;
  readonly device_id?: string;
  readonly org_id?: string;
}
