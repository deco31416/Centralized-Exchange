import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

/**
 * Stripe webhook payload (payment_intent, charge, payout, etc.)
 * Docs: https://stripe.com/docs/webhooks
 */
export interface StripeWebhookPayload {
  id?: string;
  object?: string;
  type?: string; // 'payment_intent.succeeded', 'charge.succeeded', 'payout.paid'
  api_version?: string;
  created?: number;
  data?: {
    object?: {
      id?: string;
      object?: string;
      amount?: number;
      currency?: string;
      status?: string;
      payment_method?: string;
      payment_method_details?: {
        type?: string;
      };
      customer?: string;
      description?: string;
      metadata?: Record<string, string>;
      charges?: {
        data?: Array<{
          id?: string;
          amount?: number;
          status?: string;
        }>;
      };
    };
  };
  livemode?: boolean;
}

@Injectable()
export class StripeSignatureVerifier {
  private readonly logger = new Logger(StripeSignatureVerifier.name);

  /**
   * Verifica firma de webhook Stripe
   * 
   * Stripe usa header `stripe-signature` con formato:
   * t=<timestamp>,v1=<signature>,v0=<signature>
   * 
   * Signed payload: timestamp.raw_body
   */
  verify(input: {
    signature: string | undefined;
    rawBody: string;
    secret: string | undefined;
  }): { valid: true } | { valid: false; reason: string } {
    if (!input.secret) {
      this.logger.warn('No Stripe webhook secret configured, bypassing signature verification');
      return { valid: true };
    }

    if (!input.signature) {
      return { valid: false, reason: 'missing_signature' };
    }

    // Parse signature header
    const parts = input.signature.split(',');
    let timestamp: string | undefined;
    let v1Signature: string | undefined;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') v1Signature = value;
    }

    if (!timestamp || !v1Signature) {
      return { valid: false, reason: 'malformed_signature' };
    }

    // Construir signed payload
    const signedPayload = `${timestamp}.${input.rawBody}`;

    const computed = createHmac('sha256', input.secret)
      .update(signedPayload)
      .digest('hex');

    if (computed !== v1Signature) {
      this.logger.warn('Stripe signature mismatch');
      return { valid: false, reason: 'invalid_signature' };
    }

    // Validar timestamp (max 5 min de diferencia)
    const now = Math.floor(Date.now() / 1000);
    const tsNum = parseInt(timestamp, 10);
    if (Math.abs(now - tsNum) > 300) {
      this.logger.warn('Stripe signature expired (timestamp too old/new)');
      return { valid: false, reason: 'signature_expired' };
    }

    return { valid: true };
  }
}
