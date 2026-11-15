import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO for MFA setup (TOTP)
 */
export class SetupTotpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly label: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  readonly code: string;
}

/**
 * DTO for MFA verification
 */
export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  readonly code: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly challenge_id?: string;
}

/**
 * DTO for WebAuthn registration
 */
export class WebAuthnRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly label: string;

  @IsString()
  @IsNotEmpty()
  readonly credential_id: string;

  @IsString()
  @IsNotEmpty()
  readonly public_key: string;

  @IsString()
  @IsNotEmpty()
  readonly attestation_object: string;

  @IsString()
  @IsNotEmpty()
  readonly client_data_json: string;
}

/**
 * DTO for WebAuthn authentication
 */
export class WebAuthnAuthenticationDto {
  @IsString()
  @IsNotEmpty()
  readonly credential_id: string;

  @IsString()
  @IsNotEmpty()
  readonly authenticator_data: string;

  @IsString()
  @IsNotEmpty()
  readonly client_data_json: string;

  @IsString()
  @IsNotEmpty()
  readonly signature: string;
}
