import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { FiatProviderPort } from '../ports/fiat-provider.port';
import { FiatTransfer } from '../../domain/fiat-transfer.types';

/**
 * Adapter para Stripe
 * Implementa la interfaz FiatProviderPort
 */
@Injectable()
export class StripeAdapter implements FiatProviderPort {
  readonly name = 'stripe';
  readonly requiresRawBody = true; // Stripe REQUIERE raw body
  readonly signatureHeader = 'stripe-signature';

  verifySignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      throw new Error('Missing signature or secret');
    }

    // Parsear header: "t=1234567890,v1=abcdef..."
    const parts = signature.split(',');
    const tsMatch = parts[0]?.match(/^t=(\d+)$/);
    const v1Match = parts.find((p) => p.startsWith('v1='))?.match(/^v1=([a-f0-9]+)$/);

    if (!tsMatch || !v1Match) {
      throw new Error('Invalid Stripe signature format');
    }

    const timestamp = parseInt(tsMatch[1], 10);
    const providedSignature = v1Match[1];

    // Validar timestamp (±5 minutos)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      throw new Error('Stripe signature timestamp expired');
    }

    // Signed payload: "timestamp.rawBody"
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return providedSignature === expectedSignature;
  }

  normalize(payload: any): FiatTransfer | null {
    if (!payload?.type || !payload?.data?.object) {
      return null;
    }

    const eventType = payload.type;
    const object = payload.data.object;

    // Payment Intent (INBOUND)
    if (eventType === 'payment_intent.succeeded') {
      if (!object.amount || !object.currency) {
        return null;
      }

      return {
        transferId: `stripe_${object.id}`,
        provider: this.name,
        providerTransferId: object.id,
        type: 'INBOUND',
        status: 'COMPLETED',
        currency: object.currency.toUpperCase(),
        amountMinorUnits: object.amount.toString(),
        referenceNumber: object.metadata?.user_id || object.description || '',
        concept: object.description || `Stripe payment ${object.id}`,
        receivedAt: new Date(object.created * 1000),
        rawPayload: object,
      };
    }

    // Payout (OUTBOUND)
    if (eventType === 'payout.paid') {
      if (!object.amount || !object.currency) {
        return null;
      }

      return {
        transferId: `stripe_${object.id}`,
        provider: this.name,
        providerTransferId: object.id,
        type: 'OUTBOUND',
        status: 'COMPLETED',
        currency: object.currency.toUpperCase(),
        amountMinorUnits: object.amount.toString(),
        referenceNumber: object.description || '',
        concept: object.description || `Stripe payout ${object.id}`,
        receivedAt: new Date(object.created * 1000),
        rawPayload: object,
      };
    }

    // Evento no soportado
    return null;
  }

  getIdempotencyKey(payload: any): string {
    const eventId = payload.id || payload.data?.object?.id;
    return `stripe:${eventId || Date.now()}`;
  }
}
