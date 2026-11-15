import { UserStatus } from '../../shared/types/common.types';

/**
 * Response DTO for authentication success
 */
export class AuthResponseDto {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly token_type: string = 'Bearer';
  readonly expires_in: number;
  readonly user: UserResponseDto;
}

/**
 * Response DTO for user information
 */
export class UserResponseDto {
  readonly id: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly is_email_verified: boolean;
  readonly has_mfa: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly org_id?: string;
}

/**
 * Response DTO for session information
 */
export class SessionResponseDto {
  readonly id: string;
  readonly device_name: string;
  readonly ip_address: string;
  readonly user_agent: string;
  readonly is_current: boolean;
  readonly created_at: Date;
  readonly last_seen_at: Date;
  readonly expires_at: Date;
}

/**
 * Response DTO for device information
 */
export class DeviceResponseDto {
  readonly id: string;
  readonly display_name: string;
  readonly device_type: string;
  readonly is_current: boolean;
  readonly first_seen_at: Date;
  readonly last_seen_at: Date;
  readonly session_count: number;
}

/**
 * Response DTO for MFA setup
 */
export class MfaSetupResponseDto {
  readonly secret: string;
  readonly qr_code: string;
  readonly backup_codes: string[];
}

/**
 * Response DTO for token refresh
 */
export class TokenRefreshResponseDto {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly token_type: string = 'Bearer';
  readonly expires_in: number;
}

/**
 * Response DTO for general success operations
 */
export class SuccessResponseDto {
  readonly success: boolean = true;
  readonly message: string;
}

/**
 * Response DTO for JWKS endpoint
 */
export class JwksResponseDto {
  readonly keys: JwkDto[];
}

/**
 * Response DTO for JWK
 */
export class JwkDto {
  readonly kty: string;
  readonly use: string;
  readonly alg: string;
  readonly kid: string;
  readonly n?: string;
  readonly e?: string;
  readonly x?: string;
  readonly y?: string;
  readonly crv?: string;
}

/**
 * Response DTO for OIDC discovery
 */
export class OidcDiscoveryResponseDto {
  readonly issuer: string;
  readonly authorization_endpoint: string;
  readonly token_endpoint: string;
  readonly userinfo_endpoint: string;
  readonly jwks_uri: string;
  readonly scopes_supported: string[];
  readonly response_types_supported: string[];
  readonly grant_types_supported: string[];
  readonly subject_types_supported: string[];
  readonly id_token_signing_alg_values_supported: string[];
}
