import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { TunnelModule } from './tunnel/tunnel.module';

/**
 * micro-p2p-tunnel — AppModule
 *
 * Microservicio de autorización bilateral P2P en tiempo real.
 *
 * Funcionalidad:
 *  - WebSocket (Socket.IO) para comunicación bidireccional
 *  - Sesiones de túnel: ambas partes autorizan en tiempo real
 *  - Verificación de PIN y clave dinámica via micro-signature-keys
 *  - Ejecución de transferencias via wallet-ledger-core
 *
 * Puerto: 3020
 * WebSocket namespace: /tunnel
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    HealthModule,
    TunnelModule,
  ],
})
export class AppModule {}
