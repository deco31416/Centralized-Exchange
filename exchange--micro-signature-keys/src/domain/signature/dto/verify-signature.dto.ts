import { IsString, Length, Matches } from 'class-validator';

export class VerifySignatureDto {
  @IsString()
  @Matches(/^\d+$/, { message: 'El PIN debe contener solo dígitos' })
  @Length(2, 8)
  pin: string;
}
