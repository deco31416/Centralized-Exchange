import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FiatTransfer } from '../../domain/fiat-transfer.types';
import { SpeiWebhookPayload } from './spei-signature-verifier.service';

@Injectable()
export class SpeiNormalizer {
  private readonly logger = new Logger(SpeiNormalizer.name);

  /**
   * Normaliza webhook SPEI (STP/Banorte) a FiatTransfer genérico
   */
  normalize(input: {
    provider: string;
    payload: SpeiWebhookPayload;
    receivedAt: Date;
  }): FiatTransfer | null {
    // Detectar tipo de evento
    const eventType = this.detectEventType(input.payload);
    if (!eventType) {
      this.logger.warn(`[${input.provider}] Unknown event type, skipping normalization`);
      return null;
    }

    const transferId = randomUUID();
    const providerTransferId = input.payload.id ?? input.payload.folio ?? input.payload.claveRastreo ?? transferId;

    // Para SPEI México: monto viene en pesos, convertir a centavos
    const amount = input.payload.monto ?? input.payload.amount ?? 0;
    const amountMinorUnits = String(Math.round(amount * 100));

    return {
      transferId,
      provider: input.provider,
      providerTransferId,
      type: eventType,
      status: this.mapStatus(input.payload.status),
      currency: input.payload.currency ?? 'MXN',
      amountMinorUnits,
      senderName: input.payload.nombreOrdenante,
      senderAccount: input.payload.cuentaOrdenante,
      senderBankCode: input.payload.institucionOrdenante,
      senderTaxId: input.payload.rfcCurpOrdenante,
      receiverName: input.payload.nombreBeneficiario,
      receiverAccount: input.payload.cuentaBeneficiario,
      receiverBankCode: input.payload.institucionBeneficiaria,
      receiverTaxId: input.payload.rfcCurpBeneficiario,
      trackingCode: input.payload.claveRastreo,
      referenceNumber: input.payload.referenciaNumerica?.toString(),
      concept: input.payload.conceptoPago,
      rawPayload: input.payload as unknown as Record<string, unknown>,
      receivedAt: input.receivedAt,
    };
  }

  private detectEventType(payload: SpeiWebhookPayload): 'INBOUND' | 'OUTBOUND' | null {
    // Si tiene cuentaBeneficiario = nuestra cuenta → INBOUND
    // Si tiene cuentaOrdenante = nuestra cuenta → OUTBOUND
    // Por ahora asumimos INBOUND (depósitos)
    if (payload.type === 'deposit' || payload.type === 'inbound') {
      return 'INBOUND';
    }
    if (payload.type === 'payout' || payload.type === 'outbound') {
      return 'OUTBOUND';
    }
    // Default: si tiene nombreOrdenante → INBOUND
    return payload.nombreOrdenante ? 'INBOUND' : null;
  }

  private mapStatus(status: string | undefined): 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED' {
    if (!status) return 'PENDING';
    const lower = status.toLowerCase();
    if (lower.includes('completed') || lower.includes('success') || lower.includes('liquidado')) {
      return 'COMPLETED';
    }
    if (lower.includes('failed') || lower.includes('rejected') || lower.includes('devuelto')) {
      return 'FAILED';
    }
    if (lower.includes('reversed') || lower.includes('cancelado')) {
      return 'REVERSED';
    }
    return 'PENDING';
  }
}
