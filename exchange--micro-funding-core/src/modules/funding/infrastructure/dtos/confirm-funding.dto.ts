import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import type { FundingMethod } from '../../application/ports/payment-gateway.port';
 
export class ConfirmFundingDto {
  @ApiProperty()
  @IsString()
  intentId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  walletId: string;

  @ApiProperty({
    example: 'CARD',
    enum: ['CARD', 'SPEI', 'DEPOSIT', 'STORE'],
  })
  @IsString()
  method: FundingMethod;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'MXN' })
  @IsString()
  currency: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quoteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  confirmationCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}