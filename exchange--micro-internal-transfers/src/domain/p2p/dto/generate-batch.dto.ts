import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';

class BatchCodeItemDto {
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsNotEmpty()
  amountMinorUnits!: string;

  @IsOptional()
  @IsString()
  concept?: string;
}

/**
 * DTO para generar múltiples códigos P2P en lote (dividir pagos).
 */
export class GenerateBatchDto {
  @IsString()
  @IsNotEmpty()
  fromUserId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @Type(() => BatchCodeItemDto)
  items!: BatchCodeItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  ttlMinutes?: number;
}
