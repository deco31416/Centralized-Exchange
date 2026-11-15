import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReceiveRemittanceDto } from '../dto/receive-remittance.dto';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { NOTIFICATIONS_CLIENT } from '../../domain/ports/notifications-client.port';
import type { NotificationsClientPort } from '../../domain/ports/notifications-client.port';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';
import { WALLET_LEDGER_CLIENT } from '../../domain/ports/wallet-ledger-client.port';
import type { WalletLedgerClientPort } from '../../domain/ports/wallet-ledger-client.port';

@Injectable()
export class ReceiveRemittanceUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
    @Inject(WALLET_LEDGER_CLIENT)
    private readonly walletLedgerClient: WalletLedgerClientPort,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly notificationsClient: NotificationsClientPort,
  ) {}

  async execute(id: string, dto: ReceiveRemittanceDto) {
    const remittance = await this.remittanceRepository.findById(id);

    if (!remittance) {
      throw new NotFoundException('Remesa no encontrada');
    }

    if (remittance.status !== RemittanceStatus.SENT) {
      throw new BadRequestException(
        'Solo se puede cobrar una remesa en estado SENT',
      );
    }

    if (remittance.receiverIdentifier !== dto.receiverIdentifier) {
      throw new BadRequestException(
        'El identificador receptor no coincide con la remesa',
      );
    }

    const credit = await this.walletLedgerClient.creditBalance({
      userId: remittance.receiverUserId,
      identifier: remittance.receiverIdentifier,
      amount:
        dto.receiveCurrency === remittance.targetCurrency
          ? remittance.targetAmount || remittance.amountdeco
          : remittance.amountdeco,
      currency: dto.receiveCurrency,
      reference: remittance.id,
      description: remittance.concept,
    });

    remittance.status = RemittanceStatus.RECEIVED;
    remittance.receiveCurrency = dto.receiveCurrency;
    remittance.receivedAt = new Date().toISOString();
    remittance.updatedAt = remittance.receivedAt;

    const updated = await this.remittanceRepository.update(remittance);

    await this.notificationsClient.notify('remittance.received', {
      remittanceId: updated.id,
      receiverIdentifier: updated.receiverIdentifier,
      receiveCurrency: updated.receiveCurrency,
      transactionId: credit.transactionId,
      status: updated.status,
    });

    return {
      remittance: updated,
      credit,
    };
  }
}