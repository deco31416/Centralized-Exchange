import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class WithdrawSavingDto {
  @IsString()
  savingId: string;

  @IsString()
  userId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  destinationWalletId?: string;

  @IsOptional()
  @IsString()
  signatureToken?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}