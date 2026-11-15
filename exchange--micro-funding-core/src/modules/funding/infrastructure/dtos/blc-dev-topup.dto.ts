import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class BlcDevTopupDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'BLC' })
  @IsString()
  @IsIn(['BLC'])
  currency: 'BLC';

  @ApiPropertyOptional({ example: 'development topup' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;
}
