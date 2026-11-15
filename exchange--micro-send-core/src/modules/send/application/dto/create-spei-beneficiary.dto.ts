import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateSpeiBeneficiaryDto {
  @IsString()
  @Length(1, 50)
  alias: string;

  @IsString()
  @Length(1, 100)
  beneficiaryName: string;

  @IsString()
  @Matches(/^\d{18}$/, { message: 'CLABE debe tener exactamente 18 dígitos numéricos' })
  clabe: string;

  @IsOptional()
  @IsString()
  bankCode?: string;
}
