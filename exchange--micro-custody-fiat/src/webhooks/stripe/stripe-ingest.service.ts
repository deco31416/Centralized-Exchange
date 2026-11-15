import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxService } from '../../outbox/outbox.service';
import { WebhookInboxEntry } from '../../idempotency/webhook-inbox.schema';
import { StripeNormalizer } from './stripe-normalizer.service';
import { FiatTransferDetectedEvent } from '../../domain/fiat-transfer.types';

@Injectable()
export class StripeIngestService {
  private readonly logger = new Logger(StripeIngestService.name);

  constructor(
    @InjectModel(WebhookInboxEntry.name)
    private readonly inboxModel: Model<WebhookInboxEntry>,
    private readonly outboxService: OutboxService,
    private readonly normalizer: StripeNormalizer,
  ) {}

  async ingest(input: { inboxId: string; provider: string; correlationId: string }) {
    const inbox = await this.inboxModel.findById(input.inboxId).exec();
    if (!inbox) {
      this.logger.error(`Inbox entry ${input.inboxId} not found`);
      return;
    }

    const normalized = this.normalizer.normalize({
      payload: inbox.body as any,
      receivedAt: (inbox as any).createdAt ?? new Date(),
    });

    if (!normalized) {
      this.logger.warn('Could not normalize Stripe webhook, skipping');
      return;
    }

    const event: FiatTransferDetectedEvent = {
      eventName: 'FIAT_TRANSFER_DETECTED',
      version: 'v1',
      correlationId: input.correlationId,
      payload: {
        transferId: normalized.transferId,
        provider: normalized.provider,
        providerTransferId: normalized.providerTransferId,
        type: normalized.type,
        currency: normalized.currency,
        amountMinorUnits: normalized.amountMinorUnits,
        trackingCode: normalized.trackingCode,
        referenceNumber: normalized.referenceNumber,
        senderName: normalized.senderName,
        senderAccount: normalized.senderAccount,
        receiverName: normalized.receiverName,
        receiverAccount: normalized.receiverAccount,
        concept: normalized.concept,
        receivedAt: normalized.receivedAt.toISOString(),
      },
    };

    const idempotencyKey = `FIAT_TRANSFER_DETECTED:${normalized.transferId}`;

    await this.outboxService.add({
      eventName: event.eventName,
      version: event.version,
      correlationId: event.correlationId,
      idempotencyKey,
      payload: event.payload,
    });

    this.logger.log(`Emitted FIAT_TRANSFER_DETECTED for ${normalized.transferId}`);
  }
}
