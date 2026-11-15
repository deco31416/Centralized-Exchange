import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class PayDECOPAYDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @Length(4, 8)
  pin: string;

  @IsOptional()
  @IsString()
  otp?: string;
}