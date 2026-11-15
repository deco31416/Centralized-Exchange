import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { PaymentMethodStatus } from '../../../shared/enums/p2p.enums';

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    description: 'Datos sensibles actualizados del método. Se cifran en reposo.',
    example: { accountHolder: 'Juan Pérez', accountNumber: '0987654321', bankName: 'Davivienda' },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: PaymentMethodStatus })
  @IsOptional()
  @IsEnum(PaymentMethodStatus)
  status?: PaymentMethodStatus;
}
