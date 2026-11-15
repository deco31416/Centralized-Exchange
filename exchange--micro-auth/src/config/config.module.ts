import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { createConfiguration, ConfigurationSchema } from './configuration';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Validates environment configuration at startup
 */
const validateConfig = (
  config: Record<string, unknown>,
): ConfigurationSchema => {
  const validatedConfig = plainToClass(ConfigurationSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig as object, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
};

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [createConfiguration],
      validate: validateConfig,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class ConfigModule {}
