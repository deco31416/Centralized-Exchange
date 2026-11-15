import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EnvironmentVariables } from './environment.config';
import { createConfiguration } from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (config: Record<string, unknown>) => {
        const validatedConfig = plainToClass(EnvironmentVariables, config, {
          enableImplicitConversion: true,
        });
        
        const errors = validateSync(validatedConfig, {
          skipMissingProperties: false,
        });

        if (errors.length > 0) {
          throw new Error(errors.toString());
        }
        
        return validatedConfig;
      },
      load: [
        () => {
          const env = plainToClass(EnvironmentVariables, process.env, {
            enableImplicitConversion: true,
          });
          return createConfiguration(env);
        },
      ],
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class ConfigModule {}