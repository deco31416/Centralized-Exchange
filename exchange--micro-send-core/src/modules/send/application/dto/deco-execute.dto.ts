import { IsOptional, IsString } from 'class-validator';
import { DecoQuoteDto } from './deco-quote.dto';

export class DecoExecuteDto extends DecoQuoteDto {
  @IsOptional()
  @IsString()
  otpCode?: string;
}