import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateQuoteDto {
    @IsEnum(['BUY', 'SELL', 'SWAP', 'WITHDRAW', 'DEPOSIT'])
    operation: 'BUY' | 'SELL' | 'SWAP' | 'WITHDRAW' | 'DEPOSIT';

    @IsString()
    fromAsset: string;

    @IsString()
    toAsset: string;

    @IsNumber()
    fromAmount: number; // Minor units

    @IsString()
    @IsOptional()
    userId?: string;

    @IsString()
    @IsOptional()
    fromNetwork?: string; // Optional context
}
