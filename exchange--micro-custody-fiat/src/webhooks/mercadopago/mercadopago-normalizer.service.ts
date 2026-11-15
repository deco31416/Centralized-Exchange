import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FiatTransfer } from '../../domain/fiat-transfer.types';
import { MercadoPagoWebhookPayload } from './mercadopago-signature-verifier.service';

@Injectable()
export class MercadoPagoNormalizer {
  private readonly logger = new Logger(MercadoPagoNormalizer.name);

  /**
   * Normaliza webhook Mercado Pago a FiatTransfer genérico
   */
  normalize(input: {
    payload: MercadoPagoWebhookPayload;
    receivedAt: Date;
  }): FiatTransfer | null {
    // Solo procesar payments
    if (input.payload.type !== 'payment') {
      this.logger.warn(`Skipping non-payment event: ${input.payload.type}`);
      return null;
    }

    // Detectar tipo (deposit o payout)
    const eventType = this.detectEventType(input.payload);
    if (!eventType) {
      return null;
    }

    const transferId = randomUUID();
    const providerTransferId = String(input.payload.data?.id ?? input.payload.id ?? transferId);

    // MP usa centavos directamente
    const amount = input.payload.transaction_amount ?? 0;
    const amountMinorUnits = String(Math.round(amount * 100));

    return {
      transferId,
      provider: 'mercadopago',
      providerTransferId,
      type: eventType,
      status: this.mapStatus(input.payload.status, input.payload.status_detail),
      currency: input.payload.currency_id ?? 'MXN',
      amountMinorUnits,
      senderName: input.payload.payer
        ? `${input.payload.payer.first_name ?? ''} ${input.payload.payer.last_name ?? ''}`.trim()
        : undefined,
      senderAccount: input.payload.payer?.email,
      concept: input.payload.description ?? input.payload.external_reference,
      trackingCode: providerTransferId,
      referenceNumber: input.payload.external_reference,
      rawPayload: input.payload as unknown as Record<string, unknown>,
      receivedAt: input.receivedAt,
    };
  }

  private detectEventType(payload: MercadoPagoWebhookPayload): 'INBOUND' | 'OUTBOUND' | null {
    // MP payments son INBOUND (depósitos de usuarios)
    // Payouts serían OUTBOUND (retiros)
    const action = payload.action?.toLowerCase() ?? '';
    if (action.includes('payment')) {
      return 'INBOUND';
    }
    return 'INBOUND'; // Default
  }

  private mapStatus(
    status: string | undefined,
    statusDetail: string | undefined,
  ): 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED' {
    if (!status) return 'PENDING';
    const lower = status.toLowerCase();

    if (lower === 'approved') return 'COMPLETED';
    if (lower === 'pending' || lower === 'in_process') return 'PENDING';
    if (lower === 'rejected' || lower === 'cancelled') return 'FAILED';
    if (lower === 'refunded' || lower === 'charged_back') return 'REVERSED';

    return 'PENDING';
  }
}
