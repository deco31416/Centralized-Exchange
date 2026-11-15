import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { IdempotencyModule } from '../../idempotency/idempotency.module';
import { OutboxModule } from '../../outbox/outbox.module';
import { WebhookInboxEntry, WebhookInboxEntrySchema } from '../../idempotency/webhook-inbox.schema';
import { SpeiWebhookController } from './spei-webhook.controller';
import { SpeiWebhookService } from './spei-webhook.service';
import { FiatWebhooksIngestConsumer } from './spei-webhooks.consumer';
import { FiatWebhooksIngestService } from './spei-webhooks.ingest.service';
import { SpeiSignatureVerifier } from './spei-signature-verifier.service';
import { SpeiNormalizer } from './spei-normalizer.service';
// STP Payment Services
import { STPSignatureService } from '../providers/spei/stp-signature.service';
import { STPClientService } from '../providers/spei/stp-client.service';
import { STPPaymentService } from '../providers/spei/stp-payment.service';
import { STPPaymentController } from '../providers/spei/stp-payment.controller';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';

@Module({
  imports: [
    IdempotencyModule,
    OutboxModule,
    HttpModule,
    MongooseModule.forFeature([{ name: WebhookInboxEntry.name, schema: WebhookInboxEntrySchema }]),
    BullModule.registerQueue({
      name: QUEUE_NAMES.FIAT_WEBHOOKS_INGEST,
    }),
  ],
  controllers: [
    SpeiWebhookController,
    STPPaymentController,
  ],
  providers: [
    SpeiWebhookService,
    FiatWebhooksIngestService,
    FiatWebhooksIngestConsumer,
    SpeiSignatureVerifier,
    SpeiNormalizer,
    // STP Services
    STPSignatureService,
    STPClientService,
    STPPaymentService,
    InternalAuthGuard,
  ],
  exports: [
    STPPaymentService,
    STPClientService,
    STPSignatureService,
  ],
})
export class SpeiWebhooksModule {}
