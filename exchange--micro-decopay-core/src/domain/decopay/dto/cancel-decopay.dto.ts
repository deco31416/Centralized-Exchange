import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelDECOPAYDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}