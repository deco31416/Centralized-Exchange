import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateManualDeltaDto {
    @ApiPropertyOptional({ example: 0.15, description: 'New delta in USD' })
    @IsOptional()
    @IsNumber()
    deltaUsd?: number;

    @ApiPropertyOptional({ example: 'Updated cost estimate' })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({ example: 'admin-user-id', description: 'Who is making the change' })
    @IsString()
    setBy: string;
}

export class UpdateEmergencyConfigDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({ description: 'Max emergency delta in USD' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    maxEmergencyDeltaUsd?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    autoPauseNetwork?: boolean;
}

export class UpdateNetworkDeltaDto {
    @ApiPropertyOptional({ type: UpdateManualDeltaDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateManualDeltaDto)
    manual?: UpdateManualDeltaDto;

    @ApiPropertyOptional({ type: UpdateEmergencyConfigDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateEmergencyConfigDto)
    emergencyConfig?: UpdateEmergencyConfigDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}

export class PauseNetworkDto {
    @ApiProperty({ example: 'Network congestion detected' })
    @IsString()
    reason: string;

    @ApiProperty({ example: 'admin-user-id' })
    @IsString()
    pausedBy: string;
}

export class DeactivateEmergencyDto {
    @ApiProperty({ example: 'admin-user-id' })
    @IsString()
    deactivatedBy: string;

    @ApiPropertyOptional({ example: 'Network stabilized' })
    @IsOptional()
    @IsString()
    reason?: string;
}
