import { Inject, Injectable } from '@nestjs/common';
import { CARD_VAULT_PORT } from '../tokens';
import type { CardVaultPort, SaveCardPayload } from '../ports/card-vault.port';

@Injectable()
export class SaveCardUseCase {
  constructor(
    @Inject(CARD_VAULT_PORT)
    private readonly cardVaultPort: CardVaultPort,
  ) {}

  async execute(payload: SaveCardPayload) {
    return this.cardVaultPort.saveCard(payload);
  }
}