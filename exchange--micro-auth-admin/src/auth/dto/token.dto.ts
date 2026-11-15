import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for token refresh
 */
export class RefreshTokenDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly refresh_token?: string;
}

/**
 * DTO for email verification
 */
export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly token: string;
}

/**
 * DTO for magic link authentication
 */
export class MagicLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly token: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  readonly device_name: string;
}
