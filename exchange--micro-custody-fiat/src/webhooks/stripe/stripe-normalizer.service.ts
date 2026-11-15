import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FiatTransfer } from '../../domain/fiat-transfer.types';
import { StripeWebhookPayload } from './stripe-signature-verifier.service';

@Injectable()
export class StripeNormalizer {
  private readonly logger = new Logger(StripeNormalizer.name);

  /**
   * Normaliza webhook Stripe a FiatTransfer genérico
   */
  normalize(input: {
    payload: StripeWebhookPayload;
    receivedAt: Date;
  }): FiatTransfer | null {
    const eventType = input.payload.type?.toLowerCase() ?? '';

    // Procesar payment_intent.succeeded o charge.succeeded (deposits)
    if (eventType.includes('payment_intent.succeeded') || eventType.includes('charge.succeeded')) {
      return this.normalizeDeposit(input);
    }

    // Procesar payout.paid (withdrawals)
    if (eventType.includes('payout.paid') || eventType.includes('payout.created')) {
      return this.normalizePayout(input);
    }

    this.logger.warn(`Skipping unsupported Stripe event: ${eventType}`);
    return null;
  }

  private normalizeDeposit(input: {
    payload: StripeWebhookPayload;
    receivedAt: Date;
  }): FiatTransfer | null {
    const data = input.payload.data?.object;
    if (!data) return null;

    const transferId = randomUUID();
    const providerTransferId = data.id ?? transferId;

    // Stripe usa minor units directamente (centavos)
    const amountMinorUnits = String(data.amount ?? 0);

    return {
      transferId,
      provider: 'stripe',
      providerTransferId,
      type: 'INBOUND',
      status: this.mapStatus(data.status),
      currency: (data.currency ?? 'usd').toUpperCase(),
      amountMinorUnits,
      senderAccount: data.customer,
      concept: data.description ?? data.metadata?.description,
      trackingCode: providerTransferId,
      referenceNumber: data.metadata?.reference,
      rawPayload: input.payload as unknown as Record<string, unknown>,
      receivedAt: input.receivedAt,
    };
  }

  private normalizePayout(input: {
    payload: StripeWebhookPayload;
    receivedAt: Date;
  }): FiatTransfer | null {
    const data = input.payload.data?.object;
    if (!data) return null;

    const transferId = randomUUID();
    const providerTransferId = data.id ?? transferId;
    const amountMinorUnits = String(data.amount ?? 0);

    return {
      transferId,
      provider: 'stripe',
      providerTransferId,
      type: 'OUTBOUND',
      status: this.mapStatus(data.status),
      currency: (data.currency ?? 'usd').toUpperCase(),
      amountMinorUnits,
      concept: data.description,
      trackingCode: providerTransferId,
      rawPayload: input.payload as unknown as Record<string, unknown>,
      receivedAt: input.receivedAt,
    };
  }

  private mapStatus(status: string | undefined): 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED' {
    if (!status) return 'PENDING';
    const lower = status.toLowerCase();

    if (lower === 'succeeded' || lower === 'paid') return 'COMPLETED';
    if (lower === 'pending' || lower === 'processing') return 'PENDING';
    if (lower === 'failed' || lower === 'canceled') return 'FAILED';
    if (lower === 'refunded') return 'REVERSED';

    return 'PENDING';
  }
}
