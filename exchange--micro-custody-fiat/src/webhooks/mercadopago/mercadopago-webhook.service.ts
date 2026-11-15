import { Injectable, Logger, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { createHash, randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { WebhookInboxService } from '../../idempotency/webhook-inbox.service';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { MercadoPagoSignatureVerifier } from './mercadopago-signature-verifier.service';
import { MercadoPagoIngestService } from './mercadopago-ingest.service';

@Injectable()
export class MercadoPagoWebhookService {
  private readonly logger = new Logger(MercadoPagoWebhookService.name);

  constructor(
    private readonly webhookInboxService: WebhookInboxService,
    private readonly configService: ConfigService,
    private readonly signatureVerifier: MercadoPagoSignatureVerifier,
    private readonly ingestService: MercadoPagoIngestService,
    @InjectQueue(QUEUE_NAMES.FIAT_WEBHOOKS_INGEST)
    private readonly ingestQueue: Queue,
  ) {}

  async ingestWebhook(input: {
    headers: Record<string, unknown>;
    body: Record<string, unknown>;
  }): Promise<{ status: 'accepted' | 'duplicate' | 'rejected'; inboxId?: string; reason?: string }> {
    const signature = input.headers['x-signature'] as string | undefined;
    const requestId = input.headers['x-request-id'] as string | undefined;
    const dataId = (input.body.data as any)?.id as string | undefined;

    // Verificar firma
    const secret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET');
    const verification = this.signatureVerifier.verify({
      signature,
      requestId,
      dataId,
      secret,
    });

    if (!verification.valid) {
      this.logger.warn(`Mercado Pago signature verification failed: ${verification.reason}`);
      throw new BadRequestException(`Invalid signature: ${verification.reason}`);
    }

    // Idempotency
    const providerEventId = (input.body.id as string | undefined) ?? dataId;
    const bodyHash = createHash('sha256')
      .update(JSON.stringify(input.body ?? {}))
      .digest('hex');

    const idempotencyKey = providerEventId
      ? `mercadopago:${providerEventId}`
      : `mercadopago:hash:${bodyHash}`;

    let result: Awaited<ReturnType<WebhookInboxService['tryInsert']>>;
    try {
      result = await this.webhookInboxService.tryInsert({
        provider: 'mercadopago',
        routeKey: 'webhooks/mercadopago',
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
        provider: 'mercadopago',
        correlationId,
      });
      return { status: 'accepted', inboxId: result.id };
    }

    try {
      await this.ingestQueue.add(
        {
          inboxId: result.id,
          provider: 'mercadopago',
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
