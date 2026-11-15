import { Inject, Injectable } from '@nestjs/common';
import { CARD_VAULT_PORT } from '../tokens';
import type { CardVaultPort } from '../ports/card-vault.port';

@Injectable()
export class GetSavedCardsUseCase {
  constructor(
    @Inject(CARD_VAULT_PORT)
    private readonly cardVaultPort: CardVaultPort,
  ) {}

  async execute(userId: string) {
    return this.cardVaultPort.getCardsByUserId(userId);
  }
}
