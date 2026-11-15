import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class AcceptContractDto {
  @IsBoolean()
  accepted: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  acceptedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ipAddress?: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'pin must contain exactly 6 digits' })
  pin: string;
}