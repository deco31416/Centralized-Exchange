import { IsBoolean } from 'class-validator';

export class AdminSetSmsOtpDto {
  @IsBoolean()
  enabled: boolean;
}
