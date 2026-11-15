import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for directly updating a token's price.
 * This is the most frequent operation for MANUAL tokens.
 * For PEGGED/SIMULATED tokens, the price is updated automatically
 * but admin can still override with this endpoint.
 */
export class UpdatePriceDto {
    @ApiProperty({ example: 1.02, description: 'New price in USD' })
    @IsNumber()
    @Min(0)
    priceUsd: number;

    @ApiProperty({ example: 'admin-user-id', description: 'Who is changing the price' })
    @IsString()
    changedBy: string;

    @ApiPropertyOptional({ example: 'Weekly price adjustment based on market conditions' })
    @IsOptional()
    @IsString()
    reason?: string;
}
