import { IsOptional, IsString } from 'class-validator';

export class RedeemQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  sourceAsset?: string;

  @IsOptional()
  @IsString()
  targetAsset?: string;
}