import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AdminSetCountryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  country: string; // ISO2

  /** Default 24, max 72 */
  @IsInt()
  @Min(24)
  @Max(72)
  @IsOptional()
  holdHours?: number;
}
