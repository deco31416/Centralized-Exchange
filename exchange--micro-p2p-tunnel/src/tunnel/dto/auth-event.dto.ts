import { IsString, IsNotEmpty, IsIn, IsOptional, Matches } from 'class-validator';

export class AuthEventDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsIn(['pin', 'dynamicKey', 'emailOtp'])
  method!: 'pin' | 'dynamicKey' | 'emailOtp';

  /** The actual secret (PIN digits, TOTP code, or email OTP code) */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2,8}$/, { message: 'El código debe ser de 2 a 8 dígitos numéricos' })
  value!: string;
}
