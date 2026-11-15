import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { IdempotencyModule } from '../../idempotency/idempotency.module';
import { OutboxModule } from '../../outbox/outbox.module';
import { WebhookInboxEntry, WebhookInboxEntrySchema } from '../../idempotency/webhook-inbox.schema';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { StripeIngestConsumer } from './stripe-ingest.consumer';
import { StripeIngestService } from './stripe-ingest.service';
import { StripeSignatureVerifier } from './stripe-signature-verifier.service';
import { StripeNormalizer } from './stripe-normalizer.service';

@Module({
  imports: [
    IdempotencyModule,
    OutboxModule,
    MongooseModule.forFeature([{ name: WebhookInboxEntry.name, schema: WebhookInboxEntrySchema }]),
    BullModule.registerQueue({
      name: QUEUE_NAMES.FIAT_WEBHOOKS_INGEST,
    }),
  ],
  controllers: [StripeWebhookController],
  providers: [
    StripeWebhookService,
    StripeIngestService,
    StripeIngestConsumer,
    StripeSignatureVerifier,
    StripeNormalizer,
  ],
})
export class StripeWebhooksModule {}
