import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookInboxEntry, WebhookInboxEntrySchema } from './webhook-inbox.schema';
import { WebhookInboxService } from './webhook-inbox.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookInboxEntry.name, schema: WebhookInboxEntrySchema },
    ]),
  ],
  providers: [WebhookInboxService],
  exports: [WebhookInboxService],
})
export class IdempotencyModule {}
