import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MovementTypeEnum } from '../enums/movement-type.enum';

export class GetMovementsQueryDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(MovementTypeEnum)
  type?: MovementTypeEnum;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class GetMovementByIdParamsDto {
  @IsString()
  id: string;
}

export class GetMovementByIdQueryDto {
  @IsString()
  userId: string;
}