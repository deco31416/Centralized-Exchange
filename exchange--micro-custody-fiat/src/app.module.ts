import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { HealthModule } from './health/health.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { OutboxModule } from './outbox/outbox.module';
import { OutboxRelayModule } from './outbox-relay/outbox-relay.module';
// import { WebhooksModule } from './webhooks/webhooks.module'; // Legacy - Deprecated
import { UnifiedWebhooksModule } from './webhooks/unified-webhooks.module'; // New pluggable architecture

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get<string>('REDIS_URL'),
      }),
    }),
    HealthModule,
    IdempotencyModule,
    OutboxModule,
    OutboxRelayModule,
    // WebhooksModule, // Legacy - Mantener comentado hasta migración completa
    UnifiedWebhooksModule, // Nueva arquitectura pluggable
  ],
})
export class AppModule {}

