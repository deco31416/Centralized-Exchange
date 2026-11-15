import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';

@Injectable()
export class GetRemittanceByIdUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
  ) {}

  async execute(id: string) {
    const remittance = await this.remittanceRepository.findById(id);

    if (!remittance) {
      throw new NotFoundException('Remesa no encontrada');
    }

    return remittance;
  }
}