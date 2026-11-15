import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class BaseSendDto {
  @IsString()
  @MinLength(1)
  userId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @MinLength(1)
  currency: string;

  @IsOptional()
  @IsString()
  sourceWalletId?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}