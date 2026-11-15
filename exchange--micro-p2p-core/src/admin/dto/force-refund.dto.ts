import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ForceRefundDto {
  @ApiProperty({ description: 'Razón del admin para forzar la devolución del escrow al vendedor' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Notas adicionales de auditoría' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
