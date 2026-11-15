import { IsOptional, IsString } from 'class-validator';
import { BankQuoteDto } from './bank-quote.dto';

export class BankExecuteDto extends BankQuoteDto {
  @IsOptional()
  @IsString()
  otpCode?: string;
}