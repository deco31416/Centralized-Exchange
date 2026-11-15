import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePriceBandDto {
    @ApiPropertyOptional({ example: -0.5, description: 'Buy spread %' })
    @IsOptional()
    @IsNumber()
    buySpreadPercentage?: number;

    @ApiPropertyOptional({ example: 0.5, description: 'Sell spread %' })
    @IsOptional()
    @IsNumber()
    sellSpreadPercentage?: number;

    @ApiPropertyOptional({ example: 3, description: 'Legal max upper spread %' })
    @IsOptional()
    @IsNumber()
    legalMaxUpperPercentage?: number;

    @ApiPropertyOptional({ example: 2, description: 'Legal max lower spread %' })
    @IsOptional()
    @IsNumber()
    legalMaxLowerPercentage?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({ example: 'Updated due to market conditions' })
    @IsOptional()
    @IsString()
    justification?: string;

    @ApiPropertyOptional({ example: 'admin-user-id' })
    @IsOptional()
    @IsString()
    approvedBy?: string;
}
