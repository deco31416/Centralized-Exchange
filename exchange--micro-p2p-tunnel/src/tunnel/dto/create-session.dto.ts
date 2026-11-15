import { IsString, IsNotEmpty, IsOptional, Matches, IsArray, IsIn } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsNotEmpty()
  amountMinorUnits!: string;

  @IsOptional()
  @IsString()
  concept?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['pin', 'dynamicKey', 'emailOtp'], { each: true })
  requiredMethods?: string[];
}
