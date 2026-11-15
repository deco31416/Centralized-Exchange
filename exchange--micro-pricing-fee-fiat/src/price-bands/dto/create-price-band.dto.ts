import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePriceBandDto {
    @ApiProperty({ example: 'USD_COP', description: 'Currency pair code' })
    @IsString()
    pairCode: string;

    @ApiPropertyOptional({ example: 'SWIFT', description: 'Corridor code (optional, omit for global band)' })
    @IsOptional()
    @IsString()
    corridorCode?: string;

    @ApiPropertyOptional({ enum: ['MANUAL', 'AUTO'], default: 'MANUAL', description: 'Band mode: MANUAL (admin) or AUTO (entropy engine)' })
    @IsOptional()
    @IsEnum(['MANUAL', 'AUTO'])
    mode?: 'MANUAL' | 'AUTO';

    @ApiProperty({ example: -0.5, description: 'Buy spread % (negative: -0.5 means buy at 99.5% of base)' })
    @IsNumber()
    buySpreadPercentage: number;

    @ApiProperty({ example: 0.5, description: 'Sell spread % (positive: 0.5 means sell at 100.5% of base)' })
    @IsNumber()
    sellSpreadPercentage: number;

    @ApiProperty({ example: 3, description: 'Legal max upper spread % (absolute compliance limit)' })
    @IsNumber()
    legalMaxUpperPercentage: number;

    @ApiProperty({ example: 2, description: 'Legal max lower spread % (absolute compliance limit)' })
    @IsNumber()
    legalMaxLowerPercentage: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({ example: 'Market volatility increase' })
    @IsOptional()
    @IsString()
    justification?: string;

    @ApiPropertyOptional({ example: 'admin-user-id' })
    @IsOptional()
    @IsString()
    approvedBy?: string;
}
