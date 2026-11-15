import { IsEmail, IsString, IsObject, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationPriority {
  NORMAL = 'normal',
  HIGH = 'high',
}

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  template: string;

  @IsString()
  subject: string;

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