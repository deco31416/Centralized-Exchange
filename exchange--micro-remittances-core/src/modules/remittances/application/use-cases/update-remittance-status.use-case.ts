import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';

@Injectable()
export class UpdateRemittanceStatusUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
  ) {}

  async execute(id: string, status: RemittanceStatus) {
    const remittance = await this.remittanceRepository.findById(id);

    if (!remittance) {
      throw new NotFoundException('Remesa no encontrada');
    }

    remittance.status = status;
    remittance.updatedAt = new Date().toISOString();

    return this.remittanceRepository.update(remittance);
  }
}