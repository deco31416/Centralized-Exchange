import { IsOptional, IsString, MinLength } from 'class-validator';
import { BaseSendDto } from './base-send.dto';

export class DecoQuoteDto extends BaseSendDto {
  @IsString()
  @MinLength(1)
  destinationUserId: string;

  @IsOptional()
  @IsString()
  destinationTag?: string;
}