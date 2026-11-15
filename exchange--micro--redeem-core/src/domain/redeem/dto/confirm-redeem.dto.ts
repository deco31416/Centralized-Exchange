import { IsOptional, IsString } from 'class-validator';

export class ConfirmRedeemDto {
  @IsString()
  userId!: string;

  @IsString()
  sourceAsset!: string;

  @IsString()
  targetAsset!: string;

  @IsString()
  quoteId!: string;

  @IsOptional()
  @IsString()
  confirmationToken?: string;
}