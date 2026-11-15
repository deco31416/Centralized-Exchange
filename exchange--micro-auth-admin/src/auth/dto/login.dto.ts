import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for user login
 */
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  @MaxLength(254)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  readonly password: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  readonly mfa_code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  readonly device_name?: string;
}
