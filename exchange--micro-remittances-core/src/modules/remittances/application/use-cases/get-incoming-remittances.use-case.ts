import { Inject, Injectable } from '@nestjs/common';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';

@Injectable()
export class GetIncomingRemittancesUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
  ) {}

  async execute(receiverIdentifier: string, status?: 'pending' | 'received') {
    const statuses =
      status === 'received'
        ? [RemittanceStatus.RECEIVED]
        : status === 'pending'
          ? [RemittanceStatus.SENT]
          : [RemittanceStatus.SENT, RemittanceStatus.RECEIVED];

    return this.remittanceRepository.findIncomingByReceiverIdentifier(
      receiverIdentifier,
      statuses,
    );
  }
}