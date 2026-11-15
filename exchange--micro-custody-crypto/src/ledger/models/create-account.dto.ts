import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountType, OwnerType } from './account.schema';

/**
 * DTO for creating a new ledger account.
 */
export class CreateAccountDto {
  @IsEnum(OwnerType)
  @IsNotEmpty()
  ownerType: OwnerType;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  assetCode: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  accountType: AccountType;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
