import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ForceReleaseDto {
  @ApiProperty({ description: 'Razón del admin para forzar la liberación del escrow al comprador' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Notas adicionales de auditoría' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
