import { Injectable, Logger } from '@nestjs/common';
import StripeLib from 'stripe';
import type {
  CardVaultPort,
  SaveCardPayload,
} from '../../application/ports/card-vault.port';
import type { SavedCardEntity } from '../../domain/entities/saved-card.entity';

@Injectable()
export class StripeCardVaultAdapter implements CardVaultPort {
  private readonly stripe: InstanceType<typeof StripeLib>;
  private readonly logger = new Logger(StripeCardVaultAdapter.name);

  constructor() {
    this.stripe = new StripeLib(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-04-22.dahlia',
    });
  }

  async saveCard(payload: SaveCardPayload): Promise<SavedCardEntity> {
    const customer = await this.findOrCreateCustomer(payload.userId);

    let pmId: string;

    if (payload.paymentMethodId) {
      // Modo A (PCI-safe): token ya generado por Stripe.js en el cliente
      pmId = payload.paymentMethodId;
      this.logger.log(
        `[BLACKCEX] Attaching existing Stripe PM userId=${payload.userId} pm=${pmId}`,
      );
    } else {
      // Modo B: datos crudos — solo válido en test mode con sk_test_*
      if (!payload.cardNumber || !payload.expMonth || !payload.expYear || !payload.cvv) {
        throw new Error('Se requiere paymentMethodId o datos completos de tarjeta');
      }
      const pm = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: payload.cardNumber.replace(/\s+/g, ''),
          exp_month: payload.expMonth,
          exp_year: payload.expYear,
          cvc: payload.cvv,
        },
        billing_details: { name: payload.holderName ?? '' },
      });
      pmId = pm.id;
      this.logger.log(
        `[BLACKCEX] Card tokenized server-side (test-only) userId=${payload.userId} pm=${pmId} last4=${pm.card?.last4}`,
      );
    }

    await this.stripe.paymentMethods.attach(pmId, { customer: customer.id });

    const pm = await this.stripe.paymentMethods.retrieve(pmId);

    this.logger.log(
      `[BLACKCEX] Card saved for userId=${payload.userId} pm=${pmId} last4=${pm.card?.last4}`,
    );

    return {
      cardId: pm.id,
      userId: payload.userId,
      brand: (pm.card?.brand ?? 'unknown').toUpperCase(),
      last4: pm.card?.last4 ?? '****',
      holderName: pm.billing_details.name ?? payload.holderName ?? '',
      expMonth: pm.card?.exp_month ?? payload.expMonth ?? 0,
      expYear: pm.card?.exp_year ?? payload.expYear ?? 0,
      tokenized: true,
      alias: payload.alias,
    };
  }

  async getCardsByUserId(userId: string): Promise<SavedCardEntity[]> {
    const customer = await this.findOrCreateCustomer(userId);

    const pms = await this.stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    return pms.data.map((pm) => ({
      cardId: pm.id,
      userId,
      brand: (pm.card?.brand ?? 'unknown').toUpperCase(),
      last4: pm.card?.last4 ?? '****',
      holderName: pm.billing_details.name ?? '',
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0,
      tokenized: true,
    }));
  }

  private async findOrCreateCustomer(userId: string) {
    const results = await this.stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });

    if (results.data.length > 0) {
      return results.data[0];
    }

    const customer = await this.stripe.customers.create({
      metadata: { userId },
      description: `BlackCEX user ${userId}`,
    });

    this.logger.log(
      `[BLACKCEX] Stripe customer created for userId=${userId} customerId=${customer.id}`,
    );

    return customer;
  }
}
