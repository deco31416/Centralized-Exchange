import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetQuoteDto {
  @IsString()
  userId!: string;

  @IsString()
  sourceAsset!: string;

  @IsString()
  targetAsset!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.00000001)
  sourceAmount!: number;

  @IsOptional()
  @IsString()
  walletId?: string;
}