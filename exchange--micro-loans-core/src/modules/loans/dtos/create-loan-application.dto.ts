import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const SUPPORTED_CURRENCIES = ['MXN', 'USD', 'DECOX', 'BTC'] as const;

export class CreateLoanApplicationDto {
  @IsString()
  @MaxLength(120)
  applicantFullName: string;

  @IsString()
  @MaxLength(30)
  documentNumber: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  requestedAmount: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  termMonths: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  requestedInterestRate: number;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  purpose?: string;
}