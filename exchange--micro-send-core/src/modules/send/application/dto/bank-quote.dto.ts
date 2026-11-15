import { IsOptional, IsString, MinLength } from 'class-validator';
import { BaseSendDto } from './base-send.dto';

export class BankQuoteDto extends BaseSendDto {
  @IsString()
  @MinLength(1)
  bankCode: string;

  @IsString()
  @MinLength(1)
  accountNumber: string;

  @IsString()
  @MinLength(1)
  beneficiaryName: string;

  @IsOptional()
  @IsString()
  accountType?: string;
}