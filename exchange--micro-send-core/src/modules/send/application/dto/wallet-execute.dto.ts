import { IsOptional, IsString } from 'class-validator';
import { WalletQuoteDto } from './wallet-quote.dto';

export class WalletExecuteDto extends WalletQuoteDto {
  @IsOptional()
  @IsString()
  otpCode?: string;
}