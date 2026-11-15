import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  @MaxLength(254)
  readonly email: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  readonly totp_code?: string;
}

export class ChangePhoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  readonly phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  readonly totp_code?: string;
}
