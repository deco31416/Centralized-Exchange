import { IsOptional, IsString } from 'class-validator';
import { SpeiQuoteDto } from './spei-quote.dto';

export class SpeiExecuteDto extends SpeiQuoteDto {
  @IsOptional()
  @IsString()
  otpCode?: string;
}