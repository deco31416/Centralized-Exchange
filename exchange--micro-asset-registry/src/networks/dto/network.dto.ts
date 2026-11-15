import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateNetworkDto {
    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsEnum(['BLOCKCHAIN', 'RAIL_FIAT'])
    kind: 'BLOCKCHAIN' | 'RAIL_FIAT';

    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

    @IsNumber()
    @IsOptional()
    chainId?: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    confirmations?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    minWithdrawalFee?: number;

    @IsEnum(['FIXED', 'PERCENTAGE'])
    @IsOptional()
    withdrawalFeeType?: 'FIXED' | 'PERCENTAGE';

    @IsNumber()
    @Min(0)
    @IsOptional()
    withdrawalFeeValue?: number;
}

export class UpdateNetworkDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

    @IsNumber()
    @Min(1)
    @IsOptional()
    confirmations?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    minWithdrawalFee?: number;

    @IsEnum(['FIXED', 'PERCENTAGE'])
    @IsOptional()
    withdrawalFeeType?: 'FIXED' | 'PERCENTAGE';

    @IsNumber()
    @Min(0)
    @IsOptional()
    withdrawalFeeValue?: number;
}
