import { IsString, IsNumber, IsOptional, IsJSON, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(65535)
  @Transform(({ value }): number => parseInt(value, 10) || 7003)
  PORT: number = 7003;

  @IsOptional()
  @IsString()
  NODE_ENV: string = 'development';

  @IsString()
  REDIS_URI: string;

  @IsString()
  RESEND_API_KEY: string;

  @IsString()
  RESEND_FROM_EMAIL: string;

  @IsString()
  TWILIO_ACCOUNT_SID: string;

  @IsString()
  TWILIO_AUTH_TOKEN: string;

  @IsString()
  TWILIO_FROM_NUMBER: string;

  @IsJSON()
  @Transform(({ value }) => {
    if (!value) throw new Error('SERVICE_TOKENS is required');
    // Railway may escape quotes: remove outer quotes if present
    const normalized = typeof value === 'string' ? value.trim().replace(/^["']|["']$/g, '') : value;
    // Validate it's parseable JSON
    try {
      JSON.parse(normalized);
      return normalized;
    } catch (e) {
      console.error('❌ SERVICE_TOKENS is not valid JSON:', value);
      throw new Error(`SERVICE_TOKENS must be valid JSON: ${e.message}`);
    }
  })
  SERVICE_TOKENS: string;

  @IsOptional()
  @IsJSON()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Railway may escape quotes: remove outer quotes if present
    const normalized = typeof value === 'string' ? value.trim().replace(/^["']|["']$/g, '') : value;
    // Validate it's parseable JSON
    try {
      JSON.parse(normalized);
      return normalized;
    } catch (e) {
      console.error('❌ HMAC_KEYS is not valid JSON:', value);
      throw new Error(`HMAC_KEYS must be valid JSON: ${e.message}`);
    }
  })
  HMAC_KEYS?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }): number => parseInt(value, 10) || 60)
  EMAIL_RATE_MAX: number = 60;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }): number => parseInt(value, 10) || 120)
  SMS_RATE_MAX: number = 120;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }): number => parseInt(value, 10) || 10)
  QUEUE_EMAIL_CONCURRENCY: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }): number => parseInt(value, 10) || 25)
  QUEUE_SMS_CONCURRENCY: number = 25;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }): number => parseInt(value, 10) || 6)
  QUEUE_MAX_ATTEMPTS: number = 6;

  @IsOptional()
  @IsString()
  BASE_TEMPLATE_URL?: string;
}