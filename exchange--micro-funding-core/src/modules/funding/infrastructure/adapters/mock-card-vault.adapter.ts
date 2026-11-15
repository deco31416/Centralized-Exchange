import { Injectable } from '@nestjs/common';
import type {
  CardVaultPort,
  SaveCardPayload,
} from '../../application/ports/card-vault.port';
import type { SavedCardEntity } from '../../domain/entities/saved-card.entity';

@Injectable()
export class MockCardVaultAdapter implements CardVaultPort {
  async getCardsByUserId(_userId: string): Promise<SavedCardEntity[]> {
    return [];
  }

  async saveCard(payload: SaveCardPayload): Promise<SavedCardEntity> {
    const cardNumber = payload.cardNumber ?? payload.paymentMethodId ?? '';
    const sanitized = cardNumber.replace(/\s+/g, '');
    const last4 = sanitized.length >= 4 ? sanitized.slice(-4) : '****';
    const firstDigit = sanitized.charAt(0);

    const brand =
      firstDigit === '4'
        ? 'VISA'
        : firstDigit === '5'
          ? 'MASTERCARD'
          : 'GENERIC';

    return {
      cardId: `card_${Date.now()}`,
      userId: payload.userId,
      brand,
      last4,
      holderName: payload.holderName ?? '',
      expMonth: payload.expMonth ?? 0,
      expYear: payload.expYear ?? 0,
      tokenized: true,
      alias: payload.alias,
    };
  }
}