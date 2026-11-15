import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import type { FundingMethod } from '../../application/ports/payment-gateway.port';

export class CreateFundingIntentDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  walletId: string;

  @ApiProperty({
    example: 'card',
    description: 'Código real del método de pago en minúsculas (ej: card, spei, oxxo, cash_deposit)',
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
  @IsObject()
  metadata?: Record<string, unknown>;
}