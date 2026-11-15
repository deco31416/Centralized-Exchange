import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * DTO for creating a swap request.
 * User must specify either fromAmount OR toAmount, not both.
 */
export class CreateSwapDto {
  @IsString()
  @IsNotEmpty()
  fromAsset: string;

  @IsString()
  @IsNotEmpty()
  toAsset: string;

  @IsNumber()
  @IsOptional()
  @Min(0.000001)
  @ValidateIf((o) => !o.toAmount)
  fromAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.000001)
  @ValidateIf((o) => !o.fromAmount)
  toAmount?: number;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

/**
 * DTO for requesting a quote without executing the swap.
 */
export class GetQuoteDto {
  @IsString()
  @IsNotEmpty()
  fromAsset: string;

  @IsString()
  @IsNotEmpty()
  toAsset: string;

  @IsNumber()
  @IsOptional()
  @Min(0.000001)
  @ValidateIf((o) => !o.toAmount)
  fromAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.000001)
  @ValidateIf((o) => !o.fromAmount)
  toAmount?: number;
}
