import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LineDirection } from './journal-line.schema';

/**
 * DTO for a single journal line within an entry.
 */
export class JournalLineDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsEnum(LineDirection)
  @IsNotEmpty()
  direction: LineDirection;

  @IsNumber()
  @Min(1)
  amountMinor: number;

  @IsString()
  @IsNotEmpty()
  assetCode: string;
}

/**
 * DTO for creating a new journal entry.
 * Must contain at least 2 lines and balance (sum debits = sum credits).
 */
export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty()
  externalIdempotencyKey: string;

  @IsString()
  @IsNotEmpty()
  narration: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];

  @IsString()
  @IsOptional()
  correlationId?: string;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
