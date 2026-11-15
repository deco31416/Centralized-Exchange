import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentRail } from '../../../shared/enums/p2p.enums';

export class CreateOrderDto {
  @ApiProperty({ example: 'ad-uuid-123' })
  @IsString()
  adId: string;

  @ApiProperty({ example: 0.005, description: 'Cantidad de crypto a comprar/vender' })
  @IsNumber()
  @Min(0.000001)
  cryptoAmount: number;

  @ApiPropertyOptional({ example: 'paymentMethod-uuid-456', description: 'Requerido para rail EXTERNAL_FIAT_PAYMENT' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({ description: 'Nota del comprador para el vendedor' })
  buyerNote?: string;

  @ApiPropertyOptional({
    enum: PaymentRail,
    default: PaymentRail.EXTERNAL_FIAT_PAYMENT,
    description:
      'Rail de pago. EXTERNAL_FIAT_PAYMENT (default): pago externo off-platform. ' +
      'INTERNAL_FIAT_WALLET: usa saldo fiat interno de BlackCEX (⛔ requiere P2P_ENABLE_INTERNAL_FIAT_WALLET=true).',
  })
  @IsOptional()
  @IsEnum(PaymentRail)
  paymentRail?: PaymentRail;
}
