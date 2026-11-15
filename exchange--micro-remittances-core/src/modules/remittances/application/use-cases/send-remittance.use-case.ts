import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { NOTIFICATIONS_CLIENT } from '../../domain/ports/notifications-client.port';
import type { NotificationsClientPort } from '../../domain/ports/notifications-client.port';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';
import { WALLET_LEDGER_CLIENT } from '../../domain/ports/wallet-ledger-client.port';
import type { WalletLedgerClientPort } from '../../domain/ports/wallet-ledger-client.port';

@Injectable()
export class SendRemittanceUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
    @Inject(WALLET_LEDGER_CLIENT)
    private readonly walletLedgerClient: WalletLedgerClientPort,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly notificationsClient: NotificationsClientPort,
  ) {}

  async execute(id: string) {
    const remittance = await this.remittanceRepository.findById(id);

    if (!remittance) {
      throw new NotFoundException('Remesa no encontrada');
    }

    if (remittance.status !== RemittanceStatus.CONFIRMED) {
      throw new BadRequestException(
        'Solo se puede enviar una remesa en estado CONFIRMED',
      );
    }

    if (!remittance.reservationId) {
      throw new BadRequestException(
        'La remesa no tiene reserva asociada en wallet-ledger',
      );
    }

    const capture = await this.walletLedgerClient.captureReservation({
      reservationId: remittance.reservationId,
      reference: remittance.id,
    });

    remittance.status = RemittanceStatus.SENT;
    remittance.captureId = capture.captureId;
    remittance.updatedAt = new Date().toISOString();

    const updated = await this.remittanceRepository.update(remittance);

    await this.notificationsClient.notify('remittance.sent', {
      remittanceId: updated.id,
      captureId: updated.captureId,
      senderUserId: updated.senderUserId,
      receiverIdentifier: updated.receiverIdentifier,
      amountdeco: updated.amountdeco,
      status: updated.status,
    });

    return {
      remittance: updated,
      capture,
    };
  }
}