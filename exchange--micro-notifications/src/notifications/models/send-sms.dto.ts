import { IsString, IsObject, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { NotificationPriority } from './send-email.dto';

export class SendSmsDto {
  @IsString()
  to: string;

  @IsString()
  template: string;

  @IsObject()
  variables: Record<string, any>;

  @IsString()
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  org_id?: string;

  @IsOptional()
  @IsString()
  idempotency_key?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;
}