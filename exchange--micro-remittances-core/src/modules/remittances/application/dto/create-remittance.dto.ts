import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateRemittanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  senderUserId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  senderWalletId: string;

  @ApiProperty({ enum: ['DECOX', 'EXTERNAL'] })
  @IsEnum(['DECOX', 'EXTERNAL'])
  receiverType: 'DECOX' | 'EXTERNAL';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiverUserId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverIdentifier: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiverName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiverEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiverPhone?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amountdeco: number;

  @ApiProperty({ example: 'DECOX' })
  @IsString()
  @IsNotEmpty()
  sourceCurrency: string;

  @ApiProperty({ example: 'MXN' })
  @IsString()
  @IsNotEmpty()
  targetCurrency: string;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  fxRate?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  fee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  concept?: string;
}