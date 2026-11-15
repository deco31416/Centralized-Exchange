import { IsString, MinLength } from 'class-validator';
import { BaseSendDto } from './base-send.dto';

export class WalletQuoteDto extends BaseSendDto {
  @IsString()
  @MinLength(1)
  destinationWalletId: string;
}