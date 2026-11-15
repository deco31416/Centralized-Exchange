import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { FiatProviderPort } from '../ports/fiat-provider.port';
import { FiatTransfer } from '../../domain/fiat-transfer.types';

/**
 * Adapter para SPEI (STP y Banorte)
 * Implementa la interfaz FiatProviderPort
 */
@Injectable()
export class SpeiAdapter implements FiatProviderPort {
  readonly name = 'spei';
  readonly requiresRawBody = false;
  readonly signatureHeader = 'x-signature';

  verifySignature(payload: any, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      throw new Error('Missing signature or secret');
    }

    // SPEI usa HMAC-SHA256 con JSON canónico
    const canonicalPayload = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(canonicalPayload)
      .digest('hex');

    return signature === expectedSignature;
  }

  normalize(payload: any): FiatTransfer | null {
    // Validar que tenga los campos requeridos
    if (!payload?.id || !payload?.amount || !payload?.currency) {
      return null;
    }

    // Solo procesar transfers completados
    if (payload.status !== 'completed') {
      return null;
    }

    // Convertir monto: SPEI envía en pesos, guardamos en centavos
    const amountMinorUnits = Math.round(payload.amount * 100).toString();

    return {
      transferId: `spei_${payload.id}`,
      provider: this.name,
      providerTransferId: payload.id,
      type: 'INBOUND',
      status: 'COMPLETED',
      currency: payload.currency,
      amountMinorUnits,
      referenceNumber: payload.reference || '',
      concept: payload.concept || `SPEI transfer ${payload.id}`,
      senderName: payload.sender_name,
      senderAccount: payload.sender_account,
      receivedAt: payload.created_at ? new Date(payload.created_at) : new Date(),
      rawPayload: payload,
    };
  }

  getIdempotencyKey(payload: any): string {
    // Usar ID del provider como idempotency key
    return `spei:${payload.id || payload.transaction_id || Date.now()}`;
  }
}
