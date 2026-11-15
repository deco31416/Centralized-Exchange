import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifySmsOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 10)
  readonly code: string;
}
