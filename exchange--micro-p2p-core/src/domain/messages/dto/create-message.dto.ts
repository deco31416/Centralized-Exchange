import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: '¿Puedes confirmar el pago?' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;
}
