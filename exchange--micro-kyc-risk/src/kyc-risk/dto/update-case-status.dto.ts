import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateKycRiskCaseStatusDto {
  @IsIn(['open', 'in_review', 'approved', 'rejected', 'escalated', 'closed'])
  status!: 'open' | 'in_review' | 'approved' | 'rejected' | 'escalated' | 'closed';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionNotes?: string;
}
