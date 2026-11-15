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

export class UpdateFeeScheduleDto {
    @IsOptional()
    @IsEnum(FeeScope)
    scope?: FeeScope;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    refIds?: string[];

    @IsOptional()
    @IsEnum(OperationType)
    operation?: OperationType;

    @IsOptional()
    @IsEnum(FeeType)
    feeType?: FeeType;

    /** Must be >= 0. */
    @IsOptional()
    @IsNumber()
    @Min(0)
    value?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    priority?: number;

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
