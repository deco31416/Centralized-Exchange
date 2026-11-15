import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AdSide, PaymentRail, PriceType } from '../../../shared/enums/p2p.enums';

export class CreateAdDto {
  @ApiProperty({ enum: AdSide })
  @IsEnum(AdSide)
  side: AdSide;

  @ApiProperty({ example: 'BTC' })
  @IsString()
  assetCode: string;

  @ApiProperty({ example: 'COP' })
  @IsString()
  fiatCode: string;

  @ApiProperty({ enum: PriceType })
  @IsEnum(PriceType)
  priceType: PriceType;

  @ApiPropertyOptional({ example: 350000000 })
  @IsOptional()
  @IsNumber()
  fixedPrice?: number;

  @ApiPropertyOptional({ description: 'Margen sobre precio de mercado (%)', example: 1.5 })
  @IsOptional()
  @IsNumber()
  marketMarginPercent?: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  minFiatAmount: number;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(1)
  maxFiatAmount: number;

  @ApiProperty({ example: 0.01 })
  @IsNumber()
  @Min(0.000001)
  availableCryptoAmount: number;

  @ApiProperty({ type: [String], description: 'IDs de métodos de pago del vendedor' })
  @IsArray()
  @IsString({ each: true })
  paymentMethodIds: string[];

  @ApiPropertyOptional({ description: 'Términos y condiciones del anuncio' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: PaymentRail,
    default: [PaymentRail.EXTERNAL_FIAT_PAYMENT],
    description:
      'Rails de pago aceptados en este anuncio. ' +
      'INTERNAL_FIAT_WALLET solo puede activarse cuando P2P_ENABLE_INTERNAL_FIAT_WALLET=true.',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PaymentRail, { each: true })
  acceptedPaymentRails?: PaymentRail[];
}
