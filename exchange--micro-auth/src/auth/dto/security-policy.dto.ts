import { IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SECURITY_METHODS, SERVICE_TYPES } from '../../database/schemas/security-policy.schema';

export class UpsertSecurityPolicyDto {
  @IsEnum(SERVICE_TYPES)
  serviceType: string;

  @IsOptional()
  @IsArray()
  @IsIn(SECURITY_METHODS, { each: true })
  allowedMethods?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  minRequired?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
