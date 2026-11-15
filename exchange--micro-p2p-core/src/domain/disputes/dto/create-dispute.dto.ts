import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({ description: 'Razón del reclamo', example: 'El vendedor no libera el crypto después de pagar' })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  reason: string;
}
