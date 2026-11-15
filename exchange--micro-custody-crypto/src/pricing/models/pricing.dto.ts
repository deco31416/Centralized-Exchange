import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max, IsBoolean } from 'class-validator';
import { ProviderType } from './price-provider.schema';
import { PricingBand } from './pricing-configuration.schema';

/**
 * DTO for creating a price provider.
 */
export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProviderType)
  type: ProviderType;

  @IsString({ each: true })
  assetPairs: string[];

  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;

  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsString()
  @IsOptional()
  apiKey?: string;
}

/**
 * DTO for updating a price provider.
 */
export class UpdateProviderDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;
}

/**
 * DTO for creating a pricing configuration.
 */
export class CreatePricingConfigDto {
  @IsString()
  @IsNotEmpty()
  assetPair: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  buySpread: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  sellSpread: number;
}

/**
 * DTO for updating spreads in a pricing configuration.
 */
export class UpdateSpreadsDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  buySpread: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  sellSpread: number;

  @IsString()
  @IsOptional()
  justification?: string;
}

/**
 * DTO for approving yellow band usage.
 */
export class ApproveYellowBandDto {
  @IsString()
  @IsNotEmpty()
  approvedBy: string;

  @IsString()
  @IsNotEmpty()
  justification: string;
}

/**
 * Response DTO for rate query.
 */
export class RateResponseDto {
  rate: number;
  sources: Array<{ name: string; rate: number; weight: number }>;
  timestamp: Date;
  cached: boolean;
}

/**
 * Response DTO for spread calculation.
 */
export class SpreadResultDto {
  finalRate: number;
  baseRate: number;
  spread: number;
  band: PricingBand;
  requiresJustification: boolean;
}

/**
 * Response DTO for band validation.
 */
export class BandValidationResultDto {
  band: PricingBand;
  totalSpread: number;
  isAllowed: boolean;
  requiresJustification: boolean;
  message: string;
}