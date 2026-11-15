import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManualDeltaDto {
    @ApiProperty({ example: 0.10, description: 'Fixed delta in quote currency for corridor cost' })
    @IsNumber()
    deltaUsd: number;

    @ApiProperty({ example: 'Operational cost coverage for SWIFT transfers' })
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

    @ApiPropertyOptional({ default: 5.00, description: 'Max emergency delta in quote currency' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    maxEmergencyDeltaUsd?: number = 5.00;

    @ApiPropertyOptional({ default: true, description: 'Auto-pause corridor on emergency activation' })
    @IsOptional()
    @IsBoolean()
    autoPauseNetwork?: boolean = true;
}

export class CreateNetworkDeltaDto {
    @ApiProperty({ example: 'USD_COP', description: 'Currency pair code' })
    @IsString()
    pairCode: string;

    @ApiProperty({ example: 'SWIFT', description: 'Payment corridor (SWIFT, LOCAL, ACH, SEPA)' })
    @IsString()
    corridorCode: string;

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
