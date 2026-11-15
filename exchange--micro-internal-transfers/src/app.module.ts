import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { P2PModule } from './domain/p2p/p2p.module';

/**
 * micro-internal-transfers — AppModule
 *
 * Microservicio para transferencias internas entre usuarios de DECO EXCHANGE.
 *
 * Dominios:
 *  - P2P (QR payments, QR collections, code-based transfers)
 *  - DECOPAY (futuro)
 *  - Splits (futuro)
 *  - Payment requests (futuro)
 *
 * Comunicación:
 *  - Recibe requests de api-gateway-user
 *  - Llama a wallet-ledger-core via HTTP para ejecutar movimientos contables
 *  - Futuro: emitir eventos a micro-notifications para confirmar pagos
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
    P2PModule,
  ],
})
export class AppModule {}
