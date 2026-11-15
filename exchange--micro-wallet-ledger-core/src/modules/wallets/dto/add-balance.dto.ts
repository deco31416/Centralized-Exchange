import { IsString, IsNotEmpty, IsIn, IsOptional, Matches } from 'class-validator';

export class AddBalanceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['MXN', 'USD', 'COP', 'PEN', 'SVC', 'ARS', 'CLP', 'EUR', 'VES', 'BRL', 'BLC', 'BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'DECOX', 'DECO'])
  currency!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'amountMinorUnits must be a positive integer string' })
  amountMinorUnits!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}
