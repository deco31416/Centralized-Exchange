import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSavingDto {
  @IsString()
  userId: string;

  @IsString()
  holderName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  initialAmount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  goalName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  goalAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyRate?: number;

  @IsOptional()
  @IsString()
  sourceWalletId?: string;

  @IsOptional()
  @IsString()
  signatureToken?: string;
}