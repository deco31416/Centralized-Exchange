import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

/**
 * DTO for creating a withdrawal request
 */
export class CreateWithdrawalDto {
  @IsNotEmpty()
  @IsString()
  assetCode: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0.00000001)
  amount: number;

  @IsNotEmpty()
  @IsString()
  destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}
