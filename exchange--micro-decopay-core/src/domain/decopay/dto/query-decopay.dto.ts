import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryDECOPAYDto {
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'PAID', 'CANCELLED', 'pending', 'paid', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsUUID()
  payerUserId?: string;

  @IsOptional()
  @IsUUID()
  collectorUserId?: string;
}