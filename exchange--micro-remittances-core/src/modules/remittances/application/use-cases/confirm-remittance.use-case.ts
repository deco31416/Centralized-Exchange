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
export class ConfirmRemittanceUseCase {
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

    if (remittance.status !== RemittanceStatus.CREATED) {
      throw new BadRequestException(
        'Solo se puede confirmar una remesa en estado CREATED',
      );
    }

    const summary = await this.walletLedgerClient.getSummary(remittance.senderUserId);

    if (summary.balance < remittance.amountdeco) {
      throw new BadRequestException('Saldo insuficiente para confirmar la remesa');
    }

    const reservation = await this.walletLedgerClient.reserveBalance({
      userId: remittance.senderUserId,
      walletId: remittance.senderWalletId,
      amount: remittance.amountdeco,
      currency: remittance.sourceCurrency,
      reference: remittance.id,
      description: remittance.concept,
    });

    remittance.status = RemittanceStatus.CONFIRMED;
    remittance.reservationId = reservation.reservationId;
    remittance.updatedAt = new Date().toISOString();

    const updated = await this.remittanceRepository.update(remittance);

    await this.notificationsClient.notify('remittance.confirmed', {
      remittanceId: updated.id,
      reservationId: updated.reservationId,
      senderUserId: updated.senderUserId,
      receiverIdentifier: updated.receiverIdentifier,
      amountdeco: updated.amountdeco,
      status: updated.status,
    });

    return {
      remittance: updated,
      reservation,
    };
  }
}