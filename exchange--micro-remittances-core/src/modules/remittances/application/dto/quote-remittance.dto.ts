import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class QuoteRemittanceDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'DECOX' })
  @IsString()
  @IsNotEmpty()
  sourceCurrency: string;

  @ApiProperty({ example: 'MXN' })
  @IsString()
  @IsNotEmpty()
  targetCurrency: string;
}