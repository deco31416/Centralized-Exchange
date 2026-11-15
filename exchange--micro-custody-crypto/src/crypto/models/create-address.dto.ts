import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import type { SupportedBlockchain } from './user-address.schema';

/**
 * DTO for generating a new cryptocurrency address
 */
export class CreateAddressDto {
  @IsNotEmpty()
  @IsEnum(['bitcoin', 'bsc', 'ethereum', 'stellar'])
  blockchain: SupportedBlockchain;

  @IsNotEmpty()
  @IsString()
  assetCode: string;
}
