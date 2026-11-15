import { Injectable, Logger, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { createHash, randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { WebhookInboxService } from '../../idempotency/webhook-inbox.service';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { FiatWebhooksIngestService } from './spei-webhooks.ingest.service';
import { SpeiSignatureVerifier } from './spei-signature-verifier.service';

@Injectable()
export class SpeiWebhookService {
  private readonly logger = new Logger(SpeiWebhookService.name);

  constructor(
    private readonly webhookInboxService: WebhookInboxService,
    private readonly configService: ConfigService,
    private readonly ingestService: FiatWebhooksIngestService,
    private readonly signatureVerifier: SpeiSignatureVerifier,
    @InjectQueue(QUEUE_NAMES.FIAT_WEBHOOKS_INGEST)
    private readonly ingestQueue: Queue,
  ) {}

  async ingestWebhook(input: {
    provider: string;
    headers: Record<string, unknown>;
    body: Record<string, unknown>;
  }): Promise<{ status: 'accepted' | 'duplicate' | 'rejected'; inboxId?: string; reason?: string }>{
    // 1. Verificar firma
    const signature = (input.headers['x-signature'] as string | undefined) ?? (input.headers['x-banorte-signature'] as string | undefined);
    const secret = this.configService.get<string>(`SPEI_${input.provider.toUpperCase()}_SECRET`);
    
    const verification = this.signatureVerifier.verify({
      provider: input.provider,
      signature,
      payload: input.body,
      secret,
    });

    if (!verification.valid) {
      this.logger.warn(`[${input.provider}] Signature verification failed: ${verification.reason}`);
      throw new BadRequestException(`Invalid signature: ${verification.reason}`);
    }

    const providerEventId =
      (input.headers['x-event-id'] as string | undefined) ||
      (input.body['id'] as string | undefined) ||
      undefined;

    const bodyHash = createHash('sha256')
      .update(JSON.stringify(input.body ?? {}))
      .digest('hex');

    const idempotencyKey = providerEventId
      ? `spei:${input.provider}:${providerEventId}`
      : `spei:${input.provider}:hash:${bodyHash}`;

    let result: Awaited<ReturnType<WebhookInboxService['tryInsert']>>;
    try {
      result = await this.webhookInboxService.tryInsert({
        provider: input.provider,
        routeKey: 'webhooks/spei',
        idempotencyKey,
        headers: input.headers,
        body: input.body,
      });
    } catch (error: any) {
      this.logger.error('Mongo insert into webhook_inbox failed', error?.stack ?? String(error));
      throw new ServiceUnavailableException('MongoDB unavailable');
    }

    if (!result.inserted) {
      return { status: 'duplicate' };
    }

    const correlationId = (input.headers['x-correlation-id'] as string | undefined) ?? randomUUID();
    const transport = (this.configService.get<string>('WEBHOOKS_INGEST_TRANSPORT') ?? 'bull').toLowerCase();

    if (transport === 'inline') {
      await this.ingestService.ingest({
        inboxId: result.id,
        provider: input.provider,
        correlationId,
      });
      return { status: 'accepted', inboxId: result.id };
    }

    try {
      await this.ingestQueue.add(
        {
          inboxId: result.id,
          provider: input.provider,
          correlationId,
        },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      );
    } catch (error: any) {
      this.logger.error('Redis/Bull enqueue failed', error?.stack ?? String(error));
      try {
        await this.webhookInboxService.setStatus(result.id, 'failed');
      } catch (updateError: any) {
        this.logger.error('Failed to set inbox status=failed', updateError?.stack ?? String(updateError));
      }
      throw new ServiceUnavailableException('Redis/Bull unavailable');
    }

    return { status: 'accepted', inboxId: result.id };
  }
}
