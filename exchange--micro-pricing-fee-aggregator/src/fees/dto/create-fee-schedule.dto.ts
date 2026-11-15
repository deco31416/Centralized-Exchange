import {
    IsEnum,
    IsArray,
    IsString,
    IsNumber,
    IsInt,
    IsBoolean,
    IsOptional,
    IsDateString,
    Min,
} from 'class-validator';
import { FeeScope, FeeType, OperationType } from '../schemas/fee-schedule.schema';

export class CreateFeeScheduleDto {
    @IsEnum(FeeScope)
    scope: FeeScope;

    /**
     * Referenced IDs for the scope:
     * - GLOBAL: empty array
     * - ASSET: ['BTC']
     * - NETWORK: ['ERC20']
     * - PAIR: ['BTC', 'USD']
     */
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    refIds?: string[];

    @IsEnum(OperationType)
    operation: OperationType;

    @IsEnum(FeeType)
    feeType: FeeType;

    /** Must be >= 0. For PERCENTAGE: e.g. 1.5 means 1.5%. For FIXED: amount in base units. */
    @IsNumber()
    @Min(0)
    value: number;

    /** Lower number = higher priority. PAIR=1, ASSET=2, NETWORK=3, GLOBAL=4 */
    @IsInt()
    @Min(1)
    priority: number;

    @IsOptional()
    @IsDateString()
    effectiveFrom?: string;

    @IsOptional()
    @IsDateString()
    effectiveUntil?: string;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}
