import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import StripeLib from 'stripe';
import type {
  ConfirmFundingPayload,
  CreateFundingIntentPayload,
  PaymentGatewayConfirmationResult,
  PaymentGatewayPort,
  QuoteFundingPayload,
} from '../../application/ports/payment-gateway.port';
import type { FundingIntentEntity } from '../../domain/entities/funding-intent.entity';
import type { FundingQuoteEntity } from '../../domain/entities/funding-quote.entity';

// ─────────────────────────────────────────────────────────────────
// Stripe zero-decimal currencies (no se multiplica por 100)
// Fuente: https://stripe.com/docs/currencies#zero-decimal
// ─────────────────────────────────────────────────────────────────
const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW',
  'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV',
  'XAF', 'XOF', 'XPF',
]);

// ─────────────────────────────────────────────────────────────────
// Monedas soportadas por Stripe para PaymentIntents con tarjeta.
// VES (bolívar venezolano) NO está soportado por Stripe.
// Fuente: https://stripe.com/docs/currencies
// ─────────────────────────────────────────────────────────────────
const STRIPE_SUPPORTED_CURRENCIES = new Set([
  'USD', 'EUR', 'GBP', 'MXN', 'BRL', 'COP', 'ARS', 'CLP', 'PEN',
  'CAD', 'AUD', 'NZD', 'CHF', 'JPY', 'SGD', 'HKD', 'NOK', 'SEK',
  'DKK', 'PLN', 'RON', 'HUF', 'CZK', 'INR', 'KRW', 'SVC',
  'GTQ', 'HNL', 'DOP', 'CRC', 'BOB', 'UYU', 'PYG', 'ZAR',
  'NGN', 'GHS', 'KES', 'TZS', 'MAD', 'EGP', 'TRY', 'ILS',
  'SAR', 'AED', 'QAR', 'PKR', 'BDT', 'LKR', 'THB', 'MYR',
  'PHP', 'IDR', 'VND', 'TWD',
]);

// ─────────────────────────────────────────────────────────────────
// Tabla de fees por moneda (basada en tarifas publicadas por Stripe)
// percent: porcentaje decimal   fixed: cargo fijo en la moneda local
// ─────────────────────────────────────────────────────────────────
const STRIPE_FEE_TABLE: Record<string, { percent: number; fixed: number }> = {
  // América del Norte
  USD: { percent: 0.029,  fixed: 0.30   },
  CAD: { percent: 0.029,  fixed: 0.30   },
  MXN: { percent: 0.036,  fixed: 3.00   },  // Stripe México

  // Europa
  EUR: { percent: 0.015,  fixed: 0.25   },  // Tarjetas europeas; 2.9% + €0.25 para no-EU
  GBP: { percent: 0.015,  fixed: 0.20   },  // Tarjetas UK; 2.9% + £0.20 para no-UK
  NOK: { percent: 0.025,  fixed: 2.00   },
  SEK: { percent: 0.025,  fixed: 1.80   },
  DKK: { percent: 0.025,  fixed: 1.80   },
  CHF: { percent: 0.029,  fixed: 0.30   },
  PLN: { percent: 0.029,  fixed: 1.00   },
  RON: { percent: 0.029,  fixed: 1.00   },
  HUF: { percent: 0.029,  fixed: 85     },
  CZK: { percent: 0.029,  fixed: 6.50   },

  // América del Sur / Caribe
  BRL: { percent: 0.0399, fixed: 0.39   },  // Stripe Brasil
  COP: { percent: 0.029,  fixed: 900    },  // aprox Stripe Colombia
  ARS: { percent: 0.029,  fixed: 5.00   },
  CLP: { percent: 0.029,  fixed: 250    },  // zero-decimal
  PEN: { percent: 0.029,  fixed: 1.00   },
  BOB: { percent: 0.029,  fixed: 2.00   },
  UYU: { percent: 0.029,  fixed: 10     },
  PYG: { percent: 0.029,  fixed: 1750   },  // zero-decimal
  DOP: { percent: 0.029,  fixed: 15     },
  GTQ: { percent: 0.029,  fixed: 2.30   },
  HNL: { percent: 0.029,  fixed: 7.00   },
  CRC: { percent: 0.029,  fixed: 175    },
  SVC: { percent: 0.029,  fixed: 0.30   },  // USD en El Salvador

  // Oceanía
  AUD: { percent: 0.0175, fixed: 0.30   },
  NZD: { percent: 0.029,  fixed: 0.30   },

  // Asia-Pacífico
  JPY: { percent: 0.036,  fixed: 30     },  // zero-decimal, Stripe Japan
  SGD: { percent: 0.034,  fixed: 0.50   },
  HKD: { percent: 0.034,  fixed: 2.35   },
  INR: { percent: 0.02,   fixed: 2.00   },
  KRW: { percent: 0.036,  fixed: 330    },  // zero-decimal
  THB: { percent: 0.036,  fixed: 10     },
  MYR: { percent: 0.036,  fixed: 1.20   },
  PHP: { percent: 0.036,  fixed: 15     },
  IDR: { percent: 0.029,  fixed: 4200   },
  VND: { percent: 0.029,  fixed: 7000   },  // zero-decimal
  TWD: { percent: 0.029,  fixed: 9.00   },
  PKR: { percent: 0.029,  fixed: 80     },
  BDT: { percent: 0.029,  fixed: 30     },
  LKR: { percent: 0.029,  fixed: 90     },

  // Medio Oriente / África
  AED: { percent: 0.029,  fixed: 1.00   },
  SAR: { percent: 0.029,  fixed: 1.00   },
  QAR: { percent: 0.029,  fixed: 1.00   },
  ILS: { percent: 0.029,  fixed: 1.00   },
  TRY: { percent: 0.029,  fixed: 8.00   },
  EGP: { percent: 0.029,  fixed: 15     },
  MAD: { percent: 0.029,  fixed: 3.00   },
  ZAR: { percent: 0.029,  fixed: 5.00   },
  KES: { percent: 0.029,  fixed: 40     },
  NGN: { percent: 0.029,  fixed: 130    },
  GHS: { percent: 0.029,  fixed: 3.00   },
  TZS: { percent: 0.029,  fixed: 700    },
};

/** Fallback genérico para monedas no mapeadas explícitamente */
const DEFAULT_FEE = { percent: 0.029, fixed: 0.30 };

/** Mapea el código de método de negocio → payment_method_types de Stripe */
const METHOD_TO_STRIPE_PM: Record<string, string[]> = {
  card:         ['card'],
  oxxo:         ['oxxo'],
  boleto:       ['boleto'],
  pix_stripe:   ['pix'],
  sepa_debit:   ['sepa_debit'],
  ach_debit:    ['us_bank_account'],
  ideal:        ['ideal'],
  bancontact:   ['bancontact'],
  giropay:      ['giropay'],
  sofort:       ['sofort'],
  klarna:       ['klarna'],
  przelewy24:   ['p24'],
  eps:          ['eps'],
  blik:         ['blik'],
  paynow:       ['paynow'],
  promptpay:    ['promptpay'],
  fpx:          ['fpx'],
  konbini:      ['konbini'],
};

/**
 * Métodos de pago que NO pasan por Stripe.
 * Son transferencias bancarias manuales, apps de pago, o depósitos en efectivo.
 * El sistema genera una referencia/cuenta destino para que el usuario deposite.
 */
const NON_STRIPE_METHODS = new Set([
  'spei',           // MX — Transferencia bancaria CLABE
  'pse',            // CO — Pagos Seguros en Línea
  'bancolombia',    // CO — Botón Bancolombia
  'nequi',          // CO — App Nequi
  'daviplata',      // CO — App Daviplata
  'wire',           // USD/EUR — Wire transfer
  'ach',            // USD — ACH manual (no Stripe)
  'zelle',          // USD — Zelle
  'sepa',           // EUR — SEPA manual (no Stripe Direct Debit)
  'wise',           // EUR — Wise
  'revolut',        // EUR — Revolut
  'pix',            // BRL — PIX manual (no vía Stripe)
  'nubank',         // BRL — Nubank
  'bank_transfer',  // Genérico manual
  'cash_deposit',   // Efectivo en tienda/banco manual
  'authorized_store', // Tienda autorizada interna
]);

function resolveStripePaymentMethodTypes(method: string): string[] {
  return METHOD_TO_STRIPE_PM[method.toLowerCase()] ?? ['card'];
}

function getFeeForCurrency(currency: string): { percent: number; fixed: number } {
  return STRIPE_FEE_TABLE[currency.toUpperCase()] ?? DEFAULT_FEE;
}

function toStripeAmount(amount: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

@Injectable()
export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly stripe: InstanceType<typeof StripeLib>;
  private readonly logger = new Logger(StripePaymentGatewayAdapter.name);

  constructor() {
    this.stripe = new StripeLib(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-04-22.dahlia',
    });
  }

  async createFundingIntent(
    payload: CreateFundingIntentPayload,
  ): Promise<FundingIntentEntity> {
    // Métodos no-Stripe: generar intención manual con referencia/destino
    if (NON_STRIPE_METHODS.has(payload.method.toLowerCase())) {
      return this.createManualIntent(payload);
    }

    const currencyUpper = payload.currency.toUpperCase();

    if (!STRIPE_SUPPORTED_CURRENCIES.has(currencyUpper)) {
      throw new Error(
        `La moneda ${currencyUpper} no está soportada por Stripe. ` +
        `Para pagos en esta moneda usa métodos de depósito manual.`,
      );
    }

    const stripeAmount = toStripeAmount(payload.amount, currencyUpper);
    const currency = currencyUpper.toLowerCase();
    const paymentMethodTypes = resolveStripePaymentMethodTypes(payload.method);

    this.logger.log(
      `[BLACKCEX] Creating Stripe PaymentIntent userId=${payload.userId} amount=${payload.amount} ${currency} method=${payload.method} pmTypes=${paymentMethodTypes.join(',')}`,
    );

    const intent = await this.stripe.paymentIntents.create({
      amount: stripeAmount,
      currency,
      payment_method_types: paymentMethodTypes,
      confirmation_method: 'manual',
      metadata: {
        userId: payload.userId,
        walletId: payload.walletId,
        method: payload.method,
      },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    return {
      intentId: intent.id,
      reference: intent.client_secret ?? intent.id,
      userId: payload.userId,
      walletId: payload.walletId,
      method: payload.method,
      amount: payload.amount,
      currency: payload.currency.toUpperCase(),
      status: 'PENDING_CONFIRMATION',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      metadata: { stripeIntentId: intent.id, clientSecret: intent.client_secret },
    };
  }

  async quoteFunding(payload: QuoteFundingPayload): Promise<FundingQuoteEntity> {
    const feeConfig = getFeeForCurrency(payload.currency);
    const fee =
      Math.round(
        (payload.amount * feeConfig.percent + feeConfig.fixed) * 100,
      ) / 100;
    const tax = 0;
    const total = Math.round((payload.amount + fee + tax) * 100) / 100;

    return {
      quoteId: randomUUID(),
      method: payload.method,
      amount: payload.amount,
      subtotal: payload.amount,
      fee,
      tax,
      total,
      currency: payload.currency.toUpperCase(),
      estimatedSettlementMinutes: 1,
      validUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  }

  async confirmFunding(
    payload: ConfirmFundingPayload,
  ): Promise<PaymentGatewayConfirmationResult> {
    this.logger.log(
      `[BLACKCEX] Confirming Stripe PaymentIntent intentId=${payload.intentId} pm=${payload.sourceId}`,
    );

    try {
      const intent = await this.stripe.paymentIntents.confirm(
        payload.intentId,
        { payment_method: payload.sourceId },
      );

      if (intent.status === 'succeeded') {
        this.logger.log(
          `[BLACKCEX] Stripe payment succeeded intentId=${intent.id}`,
        );
        return {
          paymentId: intent.id,
          status: 'AUTHORIZED',
          message: 'Pago autorizado por Stripe',
        };
      }

      if (intent.status === 'requires_action') {
        return {
          paymentId: intent.id,
          status: 'PENDING',
          message: 'El pago requiere autenticación adicional (3DS)',
        };
      }

      return {
        paymentId: intent.id,
        status: 'DECLINED',
        message: `Pago no completado: ${intent.status}`,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error en el procesador de pagos';
      this.logger.error(`[BLACKCEX] Stripe confirmFunding error: ${message}`);
      return {
        paymentId: payload.intentId,
        status: 'DECLINED',
        message,
      };
    }
  }

  /**
   * Genera una intención de fondeo manual para métodos no-Stripe (SPEI, PSE, Wire, etc.)
   * No llama a Stripe. Devuelve la cuenta/referencia destino donde el usuario debe depositar.
   * La CLABE y beneficiario se configuran vía variables de entorno.
   */
  private createManualIntent(
    payload: CreateFundingIntentPayload,
  ): FundingIntentEntity {
    const intentId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h para depósitos manuales

    const method = payload.method.toLowerCase();

    // Metadata según tipo de método manual
    const metadata: Record<string, unknown> = {
      manual: true,
      method,
    };

    if (method === 'spei') {
      metadata.beneficiary = process.env.SPEI_BENEFICIARY || 'BlackCEX Exchange';
      metadata.accountNumber = process.env.SPEI_CLABE || '';
      metadata.clabe = process.env.SPEI_CLABE || '';
      metadata.bank = process.env.SPEI_BANK || 'STP';
      metadata.reference = `TW-${intentId.substring(0, 8).toUpperCase()}`;
      metadata.instructions = 'Realiza una transferencia SPEI a la CLABE indicada con la referencia exacta.';
    } else if (['pse', 'bancolombia', 'nequi', 'daviplata'].includes(method)) {
      metadata.beneficiary = process.env.COL_BENEFICIARY || 'BlackCEX Exchange Colombia';
      metadata.accountNumber = process.env.COL_ACCOUNT || '';
      metadata.reference = `TW-${intentId.substring(0, 8).toUpperCase()}`;
    } else if (['wire', 'zelle', 'ach'].includes(method)) {
      metadata.beneficiary = process.env.USD_BENEFICIARY || 'BlackCEX Exchange';
      metadata.accountNumber = process.env.USD_ACCOUNT || '';
      metadata.routingNumber = process.env.USD_ROUTING || '';
      metadata.reference = `TW-${intentId.substring(0, 8).toUpperCase()}`;
    } else {
      // Genérico: referencia de depósito
      metadata.reference = `TW-${intentId.substring(0, 8).toUpperCase()}`;
      metadata.instructions = 'Comunícate con soporte para completar este depósito.';
    }

    this.logger.log(
      `[BLACKCEX] Manual intent created userId=${payload.userId} method=${method} amount=${payload.amount} ${payload.currency}`,
    );

    return {
      intentId,
      reference: metadata.reference as string,
      userId: payload.userId,
      walletId: payload.walletId,
      method: payload.method,
      amount: payload.amount,
      currency: payload.currency.toUpperCase(),
      status: 'PENDING_CONFIRMATION',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      metadata,
    };
  }
}
