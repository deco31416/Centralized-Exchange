import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';
import { WALLET_LEDGER_CLIENT } from '../../domain/ports/wallet-ledger-client.port';
import type { WalletLedgerClientPort } from '../../domain/ports/wallet-ledger-client.port';

@Injectable()
export class CancelRemittanceUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
    @Inject(WALLET_LEDGER_CLIENT)
    private readonly walletLedgerClient: WalletLedgerClientPort,
  ) {}

  async execute(id: string) {
    const remittance = await this.remittanceRepository.findById(id);

    if (!remittance) {
      throw new NotFoundException('Remesa no encontrada');
    }

    if (
      remittance.status === RemittanceStatus.RECEIVED ||
      remittance.status === RemittanceStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'No se puede cancelar una remesa ya finalizada o cancelada',
      );
    }

    if (
      remittance.status === RemittanceStatus.CONFIRMED &&
      remittance.reservationId
    ) {
      await this.walletLedgerClient.releaseReservation(remittance.reservationId);
    }

    remittance.status = RemittanceStatus.CANCELLED;
    remittance.cancelledAt = new Date().toISOString();
    remittance.updatedAt = remittance.cancelledAt;

    return this.remittanceRepository.update(remittance);
  }
}