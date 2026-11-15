import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { FiatProviderPort } from '../ports/fiat-provider.port';
import { FiatTransfer } from '../../domain/fiat-transfer.types';

/**
 * Adapter para Mercado Pago
 * Implementa la interfaz FiatProviderPort
 */
@Injectable()
export class MercadoPagoAdapter implements FiatProviderPort {
  readonly name = 'mercadopago';
  readonly requiresRawBody = false;
  readonly signatureHeader = 'x-signature';

  verifySignature(payload: any, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      throw new Error('Missing signature or secret');
    }

    // Parsear header: "ts=1234567890,v1=abcdef..."
    const parts = signature.split(',');
    const tsMatch = parts[0]?.match(/^ts=(\d+)$/);
    const v1Match = parts[1]?.match(/^v1=([a-f0-9]+)$/);

    if (!tsMatch || !v1Match) {
      throw new Error('Invalid signature format');
    }

    const timestamp = parseInt(tsMatch[1], 10);
    const providedSignature = v1Match[1];

    // Validar timestamp (±5 minutos)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      throw new Error('Signature timestamp expired');
    }

    // Reconstruir signed string: "id:X;request-id:Y;ts:Z"
    const requestId = payload.id || '';
    const signedString = `id:${payload.id};request-id:${requestId};ts:${timestamp}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedString)
      .digest('hex');

    return providedSignature === expectedSignature;
  }

  normalize(payload: any): FiatTransfer | null {
    // Mercado Pago envía metadata en _embedded o requiere GET adicional
    // Para simplificar, asumimos que viene en payload._embedded.payment
    const payment = payload._embedded?.payment || payload.data;

    if (!payment?.id || !payment?.transaction_amount) {
      return null;
    }

    // Solo procesar payments aprobados
    if (payment.status !== 'approved') {
      return null;
    }

    // Mercado Pago envía monto en unidades principales
    const amountMinorUnits = Math.round(payment.transaction_amount * 100).toString();

    return {
      transferId: `mp_${payment.id}`,
      provider: this.name,
      providerTransferId: payment.id.toString(),
      type: 'INBOUND',
      status: 'COMPLETED',
      currency: payment.currency_id || 'MXN',
      amountMinorUnits,
      referenceNumber: payment.external_reference || payment.description || '',
      concept: payment.description || `Mercado Pago payment ${payment.id}`,
      senderName: payment.payer?.email || 'Unknown',
      receivedAt: payment.date_approved 
        ? new Date(payment.date_approved) 
        : (payment.date_created ? new Date(payment.date_created) : new Date()),
      rawPayload: payment,
    };
  }

  getIdempotencyKey(payload: any): string {
    const paymentId = payload._embedded?.payment?.id || payload.data?.id || payload.id;
    return `mercadopago:${paymentId || Date.now()}`;
  }
}
