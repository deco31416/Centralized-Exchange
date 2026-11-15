import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateKycRiskCaseDto {
  @IsString()
  @MaxLength(80)
  userId!: string;

  @IsIn(['kyc', 'aml', 'risk', 'manual_review'])
  type!: 'kyc' | 'aml' | 'risk' | 'manual_review';

  @IsIn(['low', 'medium', 'high', 'critical'])
  severity!: 'low' | 'medium' | 'high' | 'critical';

  @IsString()
  @MaxLength(160)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
