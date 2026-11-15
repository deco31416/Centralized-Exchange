import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class StartTotpSetupDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  readonly label?: string;
}

export class ConfirmTotpSetupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly challenge_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  readonly code: string;
}
