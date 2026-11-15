import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ContributeSavingDto {
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
  sourceWalletId?: string;

  @IsOptional()
  @IsString()
  signatureToken?: string;

  @IsOptional()
  @IsString()
  note?: string;
}