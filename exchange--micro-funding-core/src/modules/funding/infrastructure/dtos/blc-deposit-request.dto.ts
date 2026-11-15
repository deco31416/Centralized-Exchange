import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class BlcDepositRequestDto {
  @ApiProperty({ example: 250 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'BLC' })
  @IsString()
  currency: 'BLC';

  @ApiProperty({ example: 'blc-mx-spei-001' })
  @IsString()
  selectedPaymentMethodId: string;

  @ApiPropertyOptional({ example: 'Comprobante enviado por SPEI' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  userNote?: string;

  @ApiPropertyOptional({ example: 'BLC-MX-ABC123' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;
}
