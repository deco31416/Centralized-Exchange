import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FiatTransferDetectedEvent } from '../domain/payment-events.types';
import { FiatTransferProcessor } from './fiat-transfer-processor.service';
import { WalletLedgerClient } from './wallet-ledger-client.service';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

/**
 * Controller interno para recibir eventos desde otros microservicios
 * Protegido con InternalAuthGuard para seguridad inter-servicio
 */
@Controller('internal/events')
@UseGuards(InternalAuthGuard)
export class FiatEventsConsumerController {
  constructor(
    private readonly processor: FiatTransferProcessor,
    private readonly walletClient: WalletLedgerClient,
  ) {}

  /**
   * Endpoint interno para recibir eventos FIAT_TRANSFER_DETECTED desde custody-fiat
   */
  @Post('fiat-transfer-detected')
  async handleFiatTransferDetected(@Body() event: FiatTransferDetectedEvent) {
    // Procesar y validar
    const result = await this.processor.process(event);

    if (!result.shouldConfirm) {
      return {
        status: 'skipped',
        reason: result.reason,
        transferId: event.payload.transferId,
      };
    }

    // Notificar wallet-ledger-core
    const notification = await this.walletClient.notifyDepositConfirmed(result.depositConfirmedEvent!);

    return {
      status: notification.success ? 'confirmed' : 'failed',
      transferId: event.payload.transferId,
      eventId: result.depositConfirmedEvent!.payload.eventId,
      error: notification.error,
    };
  }
}
