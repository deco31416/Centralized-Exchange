import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

const SUPPORTED_CURRENCIES = ['MXN', 'USD', 'DECOX', 'BTC'] as const;

export class SimulateLoanDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  termMonths: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  interestRate: number;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;
}