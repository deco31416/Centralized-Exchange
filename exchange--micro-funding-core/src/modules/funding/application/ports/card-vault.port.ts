import type { SavedCardEntity } from '../../domain/entities/saved-card.entity';

/**
 * Dos modos de guardar tarjeta:
 * A) Stripe.js (producción/PCI-safe): enviar solo paymentMethodId (pm_xxx)
 * B) Raw card data (solo test mode): enviar cardNumber/expMonth/expYear/cvv
 */
export interface SaveCardPayload {
  userId: string;
  holderName?: string;
  /** pm_xxx generado por Stripe.js en el cliente. Preferido sobre datos crudos. */
  paymentMethodId?: string;
  /** Solo test mode — no debe usarse en producción */
  cardNumber?: string;
  expMonth?: number;
  expYear?: number;
  cvv?: string;
  alias?: string;
}

export interface CardVaultPort {
  saveCard(payload: SaveCardPayload): Promise<SavedCardEntity>;
  getCardsByUserId(userId: string): Promise<SavedCardEntity[]>;
}