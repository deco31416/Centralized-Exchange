import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestDECOPAYOtpDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}