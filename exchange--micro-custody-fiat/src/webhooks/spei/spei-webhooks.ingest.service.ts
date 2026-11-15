import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { OutboxService } from '../../outbox/outbox.service';
import { WebhookInboxEntry } from '../../idempotency/webhook-inbox.schema';
import { SpeiNormalizer } from './spei-normalizer.service';
import { FiatTransferDetectedEvent } from '../../domain/fiat-transfer.types';

@Injectable()
export class FiatWebhooksIngestService {
  private readonly logger = new Logger(FiatWebhooksIngestService.name);

  constructor(
    @InjectModel(WebhookInboxEntry.name)
    private readonly inboxModel: Model<WebhookInboxEntry>,
    private readonly outboxService: OutboxService,
    private readonly speiNormalizer: SpeiNormalizer,
  ) {}

  async ingest(input: { inboxId: string; provider: string; correlationId: string }) {
    // 1. Recuperar inbox entry
    const inbox = await this.inboxModel.findById(input.inboxId).exec();
    if (!inbox) {
      this.logger.error(`Inbox entry ${input.inboxId} not found`);
      return;
    }

    // 2. Normalizar a FiatTransfer
    const normalized = this.speiNormalizer.normalize({
      provider: input.provider,
      payload: inbox.body as any,
      receivedAt: (inbox as any).createdAt ?? new Date(),
    });

    if (!normalized) {
      this.logger.warn(`[${input.provider}] Could not normalize webhook, skipping`);
      return;
    }

    // 3. Emitir evento FIAT_TRANSFER_DETECTED
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

    this.logger.log(`[${input.provider}] Emitted FIAT_TRANSFER_DETECTED for ${normalized.transferId}`);
  }
}
