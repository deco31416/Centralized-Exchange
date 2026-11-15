import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { SignatureModule } from './domain/signature/signature.module';
import { DynamicKeyModule } from './domain/dynamic-key/dynamic-key.module';

/**
 * micro-signature-keys — AppModule
 *
 * Microservicio independiente de firma digital para DECO EXCHANGE.
 *
 * Dominios:
 *  - Signature: PIN de 6 dígitos por usuario (crear, cambiar, verificar)
 *  - Dynamic Key: Clave dinámica TOTP-like que rota cada N segundos por usuario
 *
 * Configuración admin:
 *  - Longitud del PIN (2, 3, 4, 6, 8 dígitos)
 *  - Período de rotación de clave dinámica
 *  - Longitud de clave dinámica
 *
 * Comunicación:
 *  - Recibe requests de api-gateway-user
 *  - Llama a micro-notifications para enviar OTP al cambiar firma
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        console.log('[Mongo] Connecting to:', uri?.replace(/\/\/.*@/, '//<credentials>@'));
        return {
          uri,
          retryWrites: true,
          w: 'majority',
          serverSelectionTimeoutMS: 30000,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 45000,
          family: 4,                // Forzar IPv4 (Railway a veces resuelve IPv6)
        };
      },
    }),

    HealthModule,
    SignatureModule,
    DynamicKeyModule,
  ],
})
export class AppModule {}
