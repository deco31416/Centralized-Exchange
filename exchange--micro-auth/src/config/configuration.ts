import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Application configuration schema with validation
 */
export class ConfigurationSchema {
  @IsNumber()
  @Min(1000)
  @Max(65535)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly PORT: number = 7001;

  @IsString()
  @IsNotEmpty()
  readonly NODE_ENV: string = 'development';

  @IsString()
  @IsNotEmpty()
  readonly MONGODB_URI: string;

  @IsString()
  @IsNotEmpty()
  readonly REDIS_URI: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_ISSUER: string;

  @IsNumber()
  @Min(300)
  @Max(3600)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly JWT_ACCESS_TOKEN_TTL: number = 600; // 10 minutes

  @IsNumber()
  @Min(86400)
  @Max(7776000)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly JWT_REFRESH_TOKEN_TTL: number = 3888000; // 45 days

  @IsString()
  @IsNotEmpty()
  readonly ARGON2_PEPPER: string;

  @IsNumber()
  @Min(32)
  @Max(131072)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly ARGON2_MEMORY_COST: number = 65536; // 64MB

  @IsNumber()
  @Min(1)
  @Max(10)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly ARGON2_TIME_COST: number = 3;

  @IsNumber()
  @Min(1)
  @Max(4)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly ARGON2_PARALLELISM: number = 1;

  @IsString()
  @IsOptional()
  readonly SMTP_HOST?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  readonly SMTP_USER?: string;

  @IsString()
  @IsOptional()
  readonly SMTP_PASS?: string;

  @IsString()
  @IsOptional()
  readonly SMS_API_KEY?: string;

  @IsString()
  @IsOptional()
  readonly SMS_API_SECRET?: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly RATE_LIMIT_TTL: number = 60;

  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly RATE_LIMIT_MAX: number = 100;

  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  readonly MAX_CONCURRENT_SESSIONS: number = 10;

  @IsString()
  @IsOptional()
  readonly NOTIFICATIONS_BASE_URL?: string;

  @IsString()
  @IsOptional()
  readonly NOTIFICATIONS_SERVICE_TOKEN?: string;

  @IsString()
  @IsOptional()
  readonly INTERNAL_AUTH_TOKEN?: string;

  // Password reset session (v2)
  @IsNumber()
  @Min(120)
  @Max(3600)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly RESET_TOKEN_TTL_SECONDS?: number;

  // Sensitive changes reauth window (email OTP verified recently)
  @IsNumber()
  @Min(60)
  @Max(86400)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly SENSITIVE_REAUTH_TTL_SECONDS?: number;

  // SMS OTP (additional factor)
  @IsNumber()
  @Min(4)
  @Max(10)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly SMS_OTP_LENGTH?: number;

  @IsNumber()
  @Min(60)
  @Max(3600)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly SMS_OTP_TTL_SECONDS?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly SMS_OTP_MAX_ATTEMPTS?: number;

  @IsNumber()
  @Min(10)
  @Max(600)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly SMS_OTP_RESEND_COOLDOWN?: number;

  @IsNumber()
  @Min(60)
  @Max(3600)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly SMS_OTP_VERIFIED_TTL_SECONDS?: number;

  // TOTP (Google Authenticator)
  @IsString()
  @IsOptional()
  readonly TOTP_ISSUER?: string;

  @IsNumber()
  @Min(120)
  @Max(3600)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  readonly TOTP_SETUP_TTL_SECONDS?: number;

  @IsString()
  @IsOptional()
  readonly MFA_TOTP_ENC_KEY?: string;

  @IsString()
  @IsNotEmpty()
  readonly CORS_ORIGIN: string = 'http://localhost:3100,http://localhost:4000';
}

export const createConfiguration = (): ConfigurationSchema => ({
  PORT: parseInt(process.env.PORT || '7001', 10),
  NODE_ENV: readNodeEnv(),
  MONGODB_URI: readProductionRequired(
    'MONGODB_URI',
    'mongodb://localhost:27017/deco31416-admin-auth',
  ),
  // Compat: Railway suele exponer REDIS_URL
  REDIS_URI: readProductionRequired(
    'REDIS_URI',
    process.env.REDIS_URL || 'redis://localhost:6379',
  ),
  JWT_SECRET: readRequiredSecret('JWT_SECRET', 32),
  JWT_ISSUER: process.env.JWT_ISSUER || 'deco31416-admin-auth',
  JWT_ACCESS_TOKEN_TTL: parseInt(process.env.JWT_ACCESS_TOKEN_TTL || '600', 10),
  JWT_REFRESH_TOKEN_TTL: parseInt(
    process.env.JWT_REFRESH_TOKEN_TTL || '3888000',
    10,
  ),
  ARGON2_PEPPER: readRequiredSecret('ARGON2_PEPPER', 32),
  ARGON2_MEMORY_COST: parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10),
  ARGON2_TIME_COST: parseInt(process.env.ARGON2_TIME_COST || '3', 10),
  ARGON2_PARALLELISM: parseInt(process.env.ARGON2_PARALLELISM || '1', 10),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_API_SECRET: process.env.SMS_API_SECRET,
  RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  MAX_CONCURRENT_SESSIONS: parseInt(
    process.env.MAX_CONCURRENT_SESSIONS || '10',
    10,
  ),
  NOTIFICATIONS_BASE_URL:
    process.env.NOTIFICATIONS_BASE_URL ||
    process.env.NOTIFICATIONS_SERVICE_URL ||
    'http://localhost:7002',
  NOTIFICATIONS_SERVICE_TOKEN: process.env.NOTIFICATIONS_SERVICE_TOKEN,
  INTERNAL_AUTH_TOKEN: readRequiredSecret('INTERNAL_AUTH_TOKEN', 24),
  RESET_TOKEN_TTL_SECONDS: process.env.RESET_TOKEN_TTL_SECONDS
    ? parseInt(process.env.RESET_TOKEN_TTL_SECONDS, 10)
    : undefined,
  SENSITIVE_REAUTH_TTL_SECONDS: process.env.SENSITIVE_REAUTH_TTL_SECONDS
    ? parseInt(process.env.SENSITIVE_REAUTH_TTL_SECONDS, 10)
    : undefined,
  SMS_OTP_LENGTH: process.env.SMS_OTP_LENGTH
    ? parseInt(process.env.SMS_OTP_LENGTH, 10)
    : undefined,
  SMS_OTP_TTL_SECONDS: process.env.SMS_OTP_TTL_SECONDS
    ? parseInt(process.env.SMS_OTP_TTL_SECONDS, 10)
    : undefined,
  SMS_OTP_MAX_ATTEMPTS: process.env.SMS_OTP_MAX_ATTEMPTS
    ? parseInt(process.env.SMS_OTP_MAX_ATTEMPTS, 10)
    : undefined,
  SMS_OTP_RESEND_COOLDOWN: process.env.SMS_OTP_RESEND_COOLDOWN
    ? parseInt(process.env.SMS_OTP_RESEND_COOLDOWN, 10)
    : undefined,
  SMS_OTP_VERIFIED_TTL_SECONDS: process.env.SMS_OTP_VERIFIED_TTL_SECONDS
    ? parseInt(process.env.SMS_OTP_VERIFIED_TTL_SECONDS, 10)
    : undefined,
  TOTP_ISSUER: process.env.TOTP_ISSUER,
  TOTP_SETUP_TTL_SECONDS: process.env.TOTP_SETUP_TTL_SECONDS
    ? parseInt(process.env.TOTP_SETUP_TTL_SECONDS, 10)
    : undefined,
  MFA_TOTP_ENC_KEY: process.env.MFA_TOTP_ENC_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3100,http://localhost:4000',
});

function readNodeEnv() {
  return process.env.NODE_ENV || 'development';
}

function isProduction() {
  return readNodeEnv() === 'production';
}

function readProductionRequired(key: string, fallback: string) {
  const value = process.env[key]?.trim();
  if (isProduction() && !value) {
    throw new Error(`${key} must be configured in production.`);
  }
  return value || fallback;
}

function readRequiredSecret(key: string, minLength: number) {
  const value = process.env[key]?.trim();
  if (!value || value === 'xxxxx--xxxxx' || value.length < minLength) {
    throw new Error(
      `${key} must be configured with at least ${minLength} characters.`,
    );
  }
  return value;
}
