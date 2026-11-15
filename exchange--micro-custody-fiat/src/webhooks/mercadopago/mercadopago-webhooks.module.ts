import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { IdempotencyModule } from '../../idempotency/idempotency.module';
import { OutboxModule } from '../../outbox/outbox.module';
import { WebhookInboxEntry, WebhookInboxEntrySchema } from '../../idempotency/webhook-inbox.schema';
import { MercadoPagoWebhookController } from './mercadopago-webhook.controller';
import { MercadoPagoWebhookService } from './mercadopago-webhook.service';
import { MercadoPagoIngestConsumer } from './mercadopago-ingest.consumer';
import { MercadoPagoIngestService } from './mercadopago-ingest.service';
import { MercadoPagoSignatureVerifier } from './mercadopago-signature-verifier.service';
import { MercadoPagoNormalizer } from './mercadopago-normalizer.service';

@Module({
  imports: [
    IdempotencyModule,
    OutboxModule,
    MongooseModule.forFeature([{ name: WebhookInboxEntry.name, schema: WebhookInboxEntrySchema }]),
    BullModule.registerQueue({
      name: QUEUE_NAMES.FIAT_WEBHOOKS_INGEST,
    }),
  ],
  controllers: [MercadoPagoWebhookController],
  providers: [
    MercadoPagoWebhookService,
    MercadoPagoIngestService,
    MercadoPagoIngestConsumer,
    MercadoPagoSignatureVerifier,
    MercadoPagoNormalizer,
  ],
})
export class MercadoPagoWebhooksModule {}
