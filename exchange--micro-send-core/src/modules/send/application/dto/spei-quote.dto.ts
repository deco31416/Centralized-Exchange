import { IsOptional, IsString, MinLength } from 'class-validator';
import { BaseSendDto } from './base-send.dto';

export class SpeiQuoteDto extends BaseSendDto {
  @IsString()
  @MinLength(1)
  bankCode: string;

  @IsString()
  @MinLength(1)
  clabe: string;

  @IsString()
  @MinLength(1)
  beneficiaryName: string;

  @IsOptional()
  @IsString()
  concept?: string;
}