import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BlcAdminActionDto {
  @ApiPropertyOptional({ example: 'Validado contra comprobante bancario' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  adminNote?: string;
}
