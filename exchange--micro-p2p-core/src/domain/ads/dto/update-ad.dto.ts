import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsArray, Min } from 'class-validator';
import { AdStatus } from '../../../shared/enums/p2p.enums';

export class UpdateAdDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  availableCryptoAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fixedPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  marketMarginPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  minFiatAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxFiatAmount?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethodIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ enum: AdStatus })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;
}
