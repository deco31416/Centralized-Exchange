import { Inject, Injectable } from '@nestjs/common';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';

@Injectable()
export class GetUserRemittancesUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
  ) {}

  async execute(senderUserId: string) {
    return this.remittanceRepository.findBySenderUserId(senderUserId);
  }
}