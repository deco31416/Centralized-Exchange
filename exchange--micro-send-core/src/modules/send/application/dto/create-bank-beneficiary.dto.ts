import { IsOptional, IsString, Length } from 'class-validator';

export class CreateBankBeneficiaryDto {
  @IsString()
  @Length(1, 50)
  alias: string;

  @IsString()
  @Length(1, 100)
  beneficiaryName: string;

  @IsString()
  @Length(1, 50)
  accountNumber: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  accountType?: string;
}
