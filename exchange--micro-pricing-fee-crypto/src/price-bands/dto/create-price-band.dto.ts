import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePriceBandDto {
    @ApiProperty({ example: 'BTC', description: 'Crypto asset symbol' })
    @IsString()
    assetCode: string;

    @ApiPropertyOptional({ example: 'ERC20', description: 'Network code (optional, omit for global band)' })
    @IsOptional()
    @IsString()
    networkCode?: string;

    @ApiPropertyOptional({ enum: ['MANUAL', 'AUTO'], default: 'MANUAL', description: 'Band mode: MANUAL (admin) or AUTO (entropy engine)' })
    @IsOptional()
    @IsEnum(['MANUAL', 'AUTO'])
    mode?: 'MANUAL' | 'AUTO';

    @ApiProperty({ example: -5, description: 'Buy spread % (negative: -5 means buy at 95% of base)' })
    @IsNumber()
    buySpreadPercentage: number;

    @ApiProperty({ example: 10, description: 'Sell spread % (positive: 10 means sell at 110% of base)' })
    @IsNumber()
    sellSpreadPercentage: number;

    @ApiProperty({ example: 15, description: 'Legal max upper spread % (absolute compliance limit)' })
    @IsNumber()
    legalMaxUpperPercentage: number;

    @ApiProperty({ example: 10, description: 'Legal max lower spread % (absolute compliance limit)' })
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
