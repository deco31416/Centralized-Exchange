import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManualDeltaDto {
    @ApiProperty({ example: 0.10, description: 'Fixed delta in USD for network cost' })
    @IsNumber()
    deltaUsd: number;

    @ApiProperty({ example: 'Operational cost coverage for ERC20' })
    @IsString()
    reason: string;

    @ApiProperty({ example: 'admin-user-id' })
    @IsString()
    setBy: string;
}

export class EmergencyConfigDto {
    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean = true;

    @ApiPropertyOptional({ default: 5.00, description: 'Max emergency delta in USD' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    maxEmergencyDeltaUsd?: number = 5.00;

    @ApiPropertyOptional({ default: true, description: 'Auto-pause network on emergency activation' })
    @IsOptional()
    @IsBoolean()
    autoPauseNetwork?: boolean = true;
}

export class CreateNetworkDeltaDto {
    @ApiProperty({ example: 'USDT', description: 'Asset symbol' })
    @IsString()
    assetCode: string;

    @ApiProperty({ example: 'ERC20', description: 'Blockchain network code' })
    @IsString()
    networkCode: string;

    @ApiProperty({ type: ManualDeltaDto })
    @ValidateNested()
    @Type(() => ManualDeltaDto)
    manual: ManualDeltaDto;

    @ApiPropertyOptional({ type: EmergencyConfigDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => EmergencyConfigDto)
    emergencyConfig?: EmergencyConfigDto;
}
