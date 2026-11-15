import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AdSide, AdStatus } from '../../../shared/enums/p2p.enums';

export class QueryAdsDto {
  @ApiPropertyOptional({ enum: AdSide })
  @IsOptional()
  @IsEnum(AdSide)
  side?: AdSide;

  @ApiPropertyOptional({ example: 'BTC' })
  @IsOptional()
  @IsString()
  assetCode?: string;

  @ApiPropertyOptional({ example: 'COP' })
  @IsOptional()
  @IsString()
  fiatCode?: string;

  @ApiPropertyOptional({ enum: AdStatus })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
