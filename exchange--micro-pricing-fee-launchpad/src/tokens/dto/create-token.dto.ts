import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Sub-DTOs ────────────────────────────────────────────────────────

export class PegConfigDto {
    @ApiProperty({ enum: ['NONE', 'USD', 'EUR', 'BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'CUSTOM'], default: 'NONE' })
    @IsEnum(['NONE', 'USD', 'EUR', 'BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'CUSTOM'])
    pegType: string;

    @ApiPropertyOptional({ example: 1.0, description: '1 TOKEN = pegRatio × reference asset' })
    @IsOptional()
    @IsNumber()
    pegRatio?: number;

    @ApiPropertyOptional({ example: 'DECOX-GOLD', description: 'Custom peg reference token code' })
    @IsOptional()
    @IsString()
    pegCustomAsset?: string;

    @ApiPropertyOptional({ example: 0.5, description: 'Max % deviation before alert' })
    @IsOptional()
    @IsNumber()
    maxPegDeviation?: number;

    @ApiPropertyOptional({ default: true, description: 'Auto-correct price on deviation' })
    @IsOptional()
    @IsBoolean()
    autoSync?: boolean;
}

export class SimulationConfigDto {
    @ApiPropertyOptional({ enum: ['BULLISH', 'BEARISH', 'SIDEWAYS', 'VOLATILE'], default: 'SIDEWAYS' })
    @IsOptional()
    @IsEnum(['BULLISH', 'BEARISH', 'SIDEWAYS', 'VOLATILE'])
    trend?: string;

    @ApiPropertyOptional({ example: 0.5, description: 'Daily drift % (positive = bullish)' })
    @IsOptional()
    @IsNumber()
    dailyDriftPct?: number;

    @ApiPropertyOptional({ example: 3.0, description: 'Random volatility per tick %' })
    @IsOptional()
    @IsNumber()
    volatilityPct?: number;

    @ApiPropertyOptional({ example: 300000, description: 'New price every N ms (default: 5 min)' })
    @IsOptional()
    @IsNumber()
    tickIntervalMs?: number;

    @ApiPropertyOptional({ example: 0.3, description: 'Mean reversion strength (0–1)' })
    @IsOptional()
    @IsNumber()
    meanReversion?: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}

export class VolatilityProfileDto {
    @ApiPropertyOptional({ example: 2.0, description: 'Expected daily change %' })
    @IsOptional()
    @IsNumber()
    expectedDailyChange?: number;

    @ApiPropertyOptional({ example: 10.0, description: 'Max allowed daily change %' })
    @IsOptional()
    @IsNumber()
    maxDailyChange?: number;

    @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'], default: 'MEDIUM' })
    @IsOptional()
    @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'])
    riskLevel?: string;

    @ApiPropertyOptional({ example: 0.5, description: 'Min spread % at zero entropy' })
    @IsOptional()
    @IsNumber()
    minSpread?: number;

    @ApiPropertyOptional({ example: 5.0, description: 'Max spread % at full entropy' })
    @IsOptional()
    @IsNumber()
    maxSpread?: number;
}

// ─── Main DTO ────────────────────────────────────────────────────────

export class CreateTokenDto {
    @ApiProperty({ example: 'DECOX-USD', description: 'Unique token code (uppercase)' })
    @IsString()
    tokenCode: string;

    @ApiProperty({ example: 'DECOX Dollar', description: 'Human-readable token name' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ enum: ['STABLE', 'ALTCOIN', 'UTILITY', 'PARTNER', 'MEME'], default: 'ALTCOIN' })
    @IsOptional()
    @IsEnum(['STABLE', 'ALTCOIN', 'UTILITY', 'PARTNER', 'MEME'])
    category?: string;

    @ApiPropertyOptional({ example: 'DECO EXCHANGE stablecoin pegged to USD' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'https://cdn.deco31416.com/icons/DECOX-usd.png' })
    @IsOptional()
    @IsString()
    iconUrl?: string;

    @ApiProperty({ enum: ['MANUAL', 'PEGGED', 'INTERNAL', 'SIMULATED'], description: 'How the base price is determined' })
    @IsEnum(['MANUAL', 'PEGGED', 'INTERNAL', 'SIMULATED'])
    pricingModel: string;

    @ApiPropertyOptional({ type: PegConfigDto, description: 'Peg configuration (required for PEGGED model)' })
    @IsOptional()
    @ValidateNested()
    @Type(() => PegConfigDto)
    pegConfig?: PegConfigDto;

    @ApiPropertyOptional({ type: SimulationConfigDto, description: 'Simulation configuration (required for SIMULATED model)' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SimulationConfigDto)
    simulationConfig?: SimulationConfigDto;

    @ApiPropertyOptional({ type: VolatilityProfileDto, description: 'Volatility and spread profile' })
    @IsOptional()
    @ValidateNested()
    @Type(() => VolatilityProfileDto)
    volatilityProfile?: VolatilityProfileDto;

    @ApiProperty({ example: 1.0, description: 'Initial price in USD' })
    @IsNumber()
    @Min(0)
    currentPriceUsd: number;

    @ApiPropertyOptional({ example: 0.95, description: 'Price floor (0 = no floor)' })
    @IsOptional()
    @IsNumber()
    priceFloorUsd?: number;

    @ApiPropertyOptional({ example: 1.05, description: 'Price ceiling (0 = no ceiling)' })
    @IsOptional()
    @IsNumber()
    priceCeilingUsd?: number;

    @ApiPropertyOptional({ example: 1000000 })
    @IsOptional()
    @IsNumber()
    totalSupply?: number;

    @ApiPropertyOptional({ example: 500000 })
    @IsOptional()
    @IsNumber()
    circulatingSupply?: number;

    @ApiPropertyOptional({ example: ['ERC20', 'BSC', 'INTERNAL'], description: 'Supported blockchain networks' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    supportedNetworks?: string[];

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({ example: 'admin-user-id' })
    @IsOptional()
    @IsString()
    createdBy?: string;
}
