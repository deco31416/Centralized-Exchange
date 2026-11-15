import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PegConfigDto, SimulationConfigDto, VolatilityProfileDto } from './create-token.dto';

export class UpdateTokenDto {
    @ApiPropertyOptional({ example: 'DECOX Dollar v2' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ enum: ['STABLE', 'ALTCOIN', 'UTILITY', 'PARTNER', 'MEME'] })
    @IsOptional()
    @IsEnum(['STABLE', 'ALTCOIN', 'UTILITY', 'PARTNER', 'MEME'])
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    iconUrl?: string;

    @ApiPropertyOptional({ enum: ['MANUAL', 'PEGGED', 'INTERNAL', 'SIMULATED'], description: 'Change pricing model (caution: may reset price source)' })
    @IsOptional()
    @IsEnum(['MANUAL', 'PEGGED', 'INTERNAL', 'SIMULATED'])
    pricingModel?: string;

    @ApiPropertyOptional({ type: PegConfigDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => PegConfigDto)
    pegConfig?: PegConfigDto;

    @ApiPropertyOptional({ type: SimulationConfigDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => SimulationConfigDto)
    simulationConfig?: SimulationConfigDto;

    @ApiPropertyOptional({ type: VolatilityProfileDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => VolatilityProfileDto)
    volatilityProfile?: VolatilityProfileDto;

    @ApiPropertyOptional({ example: 0.90, description: 'Price floor (0 = no floor)' })
    @IsOptional()
    @IsNumber()
    priceFloorUsd?: number;

    @ApiPropertyOptional({ example: 1.10, description: 'Price ceiling (0 = no ceiling)' })
    @IsOptional()
    @IsNumber()
    priceCeilingUsd?: number;

    @ApiPropertyOptional({ example: 1000000 })
    @IsOptional()
    @IsNumber()
    totalSupply?: number;

    @ApiPropertyOptional({ example: 750000 })
    @IsOptional()
    @IsNumber()
    circulatingSupply?: number;

    @ApiPropertyOptional({ example: ['ERC20', 'BSC', 'INTERNAL'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    supportedNetworks?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({ example: 'admin-user-id' })
    @IsOptional()
    @IsString()
    updatedBy?: string;
}
