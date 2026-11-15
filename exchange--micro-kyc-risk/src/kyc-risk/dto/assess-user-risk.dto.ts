import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AssessUserRiskDto {
  @IsString()
  @MaxLength(80)
  userId!: string;

  @IsIn(['none', 'level_1', 'level_2', 'level_3', 'institutional'])
  kycLevel!: 'none' | 'level_1' | 'level_2' | 'level_3' | 'institutional';

  @IsInt()
  @Min(0)
  @Max(100)
  transactionRiskScore!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  securityRiskScore!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  externalRiskScore!: number;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  reason?: string;
}
