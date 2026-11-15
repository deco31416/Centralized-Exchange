import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';
import type { FundingMethod } from '../../application/ports/payment-gateway.port';

export class QuoteFundingDto {
  @ApiProperty({
    example: 'card',
    description: 'Código real del método de pago en minúsculas (ej: card, spei, oxxo)',
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
}