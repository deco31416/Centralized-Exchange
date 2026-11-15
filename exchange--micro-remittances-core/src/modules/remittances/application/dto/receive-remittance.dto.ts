import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReceiveRemittanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverIdentifier: string;

  @ApiProperty({ example: 'DECOX' })
  @IsString()
  @IsNotEmpty()
  receiveCurrency: string;
}