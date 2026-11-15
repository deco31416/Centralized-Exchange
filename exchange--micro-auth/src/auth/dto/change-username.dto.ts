import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class ChangeUsernameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  @Matches(/^[a-zA-Z0-9._-]{4,18}$/, {
    message: 'username must match ^[a-zA-Z0-9._-]{4,18}$',
  })
  username: string;

  @IsString()
  @IsOptional()
  totp_code?: string;
}
