import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { FiatTransferDetectedEvent, FiatDepositConfirmedEvent } from '../domain/payment-events.types';

@Injectable()
export class FiatTransferProcessor {
  private readonly logger = new Logger(FiatTransferProcessor.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Procesa transferencia FIAT detectada y emite confirmación si pasa validaciones
   * 
   * Validaciones básicas v1:
   * 1. Solo INBOUND (depósitos)
   * 2. Status COMPLETED
   * 3. Monto > 0
   * 4. Extraer userId desde referenceNumber o concept
   */
  async process(event: FiatTransferDetectedEvent): Promise<{
    shouldConfirm: boolean;
    depositConfirmedEvent?: FiatDepositConfirmedEvent;
    reason?: string;
  }> {
    const transfer = event.payload;

    // Solo procesar depósitos
    if (transfer.type !== 'INBOUND') {
      return { shouldConfirm: false, reason: 'not_inbound' };
    }

    // Validar monto
    const amount = BigInt(transfer.amountMinorUnits);
    if (amount <= 0) {
      return { shouldConfirm: false, reason: 'invalid_amount' };
    }

    // Extraer userId (mock: desde referenceNumber o concept)
    const userId = this.extractUserId(transfer.referenceNumber ?? transfer.concept);
    if (!userId) {
      this.logger.warn(`Could not extract userId from transfer ${transfer.transferId}`);
      return { shouldConfirm: false, reason: 'missing_user_id' };
    }

    // Construir evento confirmado
    const depositConfirmedEvent: FiatDepositConfirmedEvent = {
      eventName: 'FIAT_DEPOSIT_CONFIRMED',
      version: 'v1',
      correlationId: event.correlationId,
      payload: {
        eventId: randomUUID(),
        userId,
        currency: transfer.currency,
        amountMinorUnits: transfer.amountMinorUnits,
        transferId: transfer.transferId,
        provider: transfer.provider,
        providerTransferId: transfer.providerTransferId,
        trackingCode: transfer.trackingCode,
        externalRef: {
          senderName: transfer.senderName,
          senderAccount: transfer.senderAccount,
          concept: transfer.concept,
        },
      },
    };

    return { shouldConfirm: true, depositConfirmedEvent };
  }

  /**
   * Extrae userId desde referenceNumber o concept
   * 
   * Formato esperado: "user_123" o "USER:user_123" o solo "user_123"
   */
  private extractUserId(reference: string | undefined): string | null {
    if (!reference) return null;

    // Buscar patrón user_XXX o UUID
    const userMatch = reference.match(/user_[a-zA-Z0-9_-]+/i);
    if (userMatch) {
      return userMatch[0];
    }

    // Buscar UUID
    const uuidMatch = reference.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
      return uuidMatch[0];
    }

    // Si parece un userId simple (alfanumérico)
    if (/^[a-zA-Z0-9_-]{3,50}$/.test(reference)) {
      return reference;
    }

    return null;
  }
}
