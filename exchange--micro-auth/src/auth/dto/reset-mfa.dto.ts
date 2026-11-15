import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class ResetTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly resetToken: string;
}

export class ResetVerifySmsOtpDto extends ResetTokenDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 10)
  readonly code: string;
}

export class ResetVerifyTotpDto extends ResetTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  readonly code: string;
}
