import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { PaymentMethodType } from '../../../shared/enums/p2p.enums';

export class CreatePaymentMethodDto {
  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({ example: 'CO' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'COP' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'Mi cuenta Bancolombia' })
  @IsString()
  label: string;

  /**
   * Datos sensibles del método de pago.
   * Se cifran con AES-256-GCM antes de persistir en MongoDB.
   * Nunca se guardan en texto plano.
   * Ejemplo: { accountHolder, accountNumber, bankName, phone }
   */
  @ApiPropertyOptional({
    description: 'Datos sensibles del método (cuenta, titular, banco). Se cifran en reposo.',
    example: { accountHolder: 'Juan Pérez', accountNumber: '1234567890', bankName: 'Bancolombia' },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}
