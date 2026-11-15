import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { FiatProviderPort, WebhookProcessingResult } from '../ports/fiat-provider.port';
import { WebhookInboxService } from '../../idempotency/webhook-inbox.service';
import { OutboxService } from '../../outbox/outbox.service';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio unificado para procesamiento de webhooks
 * 
 * Maneja la lógica común a todos los providers:
 * 1. Verificación de firma
 * 2. Deduplicación (inbox)
 * 3. Encolado (Bull) o procesamiento inline
 * 4. Normalización
 * 5. Publicación de evento (outbox)
 */
@Injectable()
export class UnifiedWebhookService {
  private readonly logger = new Logger(UnifiedWebhookService.name);
  private readonly transport: string;

  constructor(
    private readonly inboxService: WebhookInboxService,
    private readonly outboxService: OutboxService,
    private readonly configService: ConfigService,
  ) {
    this.transport =
      this.configService.get<string>('WEBHOOKS_INGEST_TRANSPORT') || 'inline';
  }

  /**
   * Procesa un webhook de cualquier provider
   */
  async processWebhook(
    adapter: FiatProviderPort,
    payloadForVerification: any,
    signature: string,
    secret: string,
    bodyParsed: any,
  ): Promise<WebhookProcessingResult> {
    try {
      // 1. Verificar firma
      const isValid = adapter.verifySignature(payloadForVerification, signature, secret);
      if (!isValid) {
        this.logger.warn(`Invalid signature for provider ${adapter.name}`);
        return { success: false, error: 'Invalid signature' };
      }

      // Bull transport has no consumer for this unified job contract yet.
      // Reject before persisting inbox state so the provider can retry after deployment is fixed.
      if (this.transport === 'bull') {
        throw new ServiceUnavailableException(
          'Unified webhook queue processing is not configured; use inline transport or the provider-specific endpoint.',
        );
      }

      // 2. Process into the idempotent outbox before marking the inbox accepted.
      // If processing fails, the provider retry can attempt the same idempotency key again.
      const idempotencyKey = adapter.getIdempotencyKey(bodyParsed);
      const result = await this.processInline(adapter, bodyParsed, idempotencyKey);
      if (!result.success) return result;

      const insertResult = await this.inboxService.tryInsert({
        provider: adapter.name,
        routeKey: `/webhooks/${adapter.name}`,
        idempotencyKey,
        headers: {} as Record<string, unknown>,
        body: bodyParsed as Record<string, unknown>,
      });

      if (!insertResult.inserted) {
        this.logger.log(`Duplicate webhook detected: ${idempotencyKey}`);
        return { success: true, error: 'Duplicate (already processed)' };
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      return { success: false, error: error.message, shouldRetry: true };
    }
  }

  /**
   * Procesa el webhook inline (sin Bull queue)
   */
  private async processInline(
    adapter: FiatProviderPort,
    payload: any,
    idempotencyKey: string,
  ): Promise<WebhookProcessingResult> {
    try {
      // Normalizar
      const normalized = adapter.normalize(payload);

      if (!normalized) {
        this.logger.warn(`Payload not processable for provider ${adapter.name}`);
        return { success: true, error: 'Payload not processable (ignored)' };
      }

      // Publicar evento
      const correlationId = `${adapter.name}_${Date.now()}`;
      await this.outboxService.add({
        eventName: 'FIAT_TRANSFER_DETECTED',
        version: 'v1',
        correlationId,
        idempotencyKey,
        payload: {
          transferId: normalized.transferId,
          provider: normalized.provider,
          providerTransferId: normalized.providerTransferId,
          type: normalized.type,
          currency: normalized.currency,
          amountMinorUnits: normalized.amountMinorUnits,
          referenceNumber: normalized.referenceNumber || '',
          concept: normalized.concept || '',
          receivedAt: normalized.receivedAt instanceof Date 
            ? normalized.receivedAt.toISOString()
            : normalized.receivedAt,
        },
      });

      this.logger.log(`Event published: ${correlationId} for transfer ${normalized.transferId}`);

      return {
        success: true,
        transferId: normalized.transferId,
      };
    } catch (error: any) {
      this.logger.error(`Error processing inline: ${error.message}`, error.stack);
      return { success: false, error: error.message, shouldRetry: true };
    }
  }
}
