import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

/**
 * Mercado Pago webhook payload (payment notification)
 * Docs: https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
 */
export interface MercadoPagoWebhookPayload {
  // IPN/Webhooks v2
  id?: number | string;
  live_mode?: boolean;
  type?: string; // 'payment', 'subscription_preapproval', etc.
  date_created?: string;
  user_id?: number | string;
  api_version?: string;
  action?: string; // 'payment.created', 'payment.updated'
  data?: {
    id?: string; // payment ID
  };
  // Payment details (si se incluye expanded)
  status?: string; // 'approved', 'pending', 'rejected'
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string; // 'MXN', 'ARS', 'BRL'
  payer?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  payment_method_id?: string;
  payment_type_id?: string;
  description?: string;
  external_reference?: string;
}

@Injectable()
export class MercadoPagoSignatureVerifier {
  private readonly logger = new Logger(MercadoPagoSignatureVerifier.name);

  /**
   * Verifica firma de webhook Mercado Pago
   * 
   * MP usa header `x-signature` con formato:
   * ts=<timestamp>,v1=<hmac_sha256>
   * 
   * Signed string: id:<data_id>;request-id:<request_id>;ts:<timestamp>
   */
  verify(input: {
    signature: string | undefined;
    requestId: string | undefined;
    dataId: string | undefined;
    secret: string | undefined;
  }): { valid: true } | { valid: false; reason: string } {
    if (!input.secret) {
      this.logger.warn('No Mercado Pago secret configured, bypassing signature verification');
      return { valid: true };
    }

    if (!input.signature) {
      return { valid: false, reason: 'missing_signature' };
    }

    // Parse signature header: ts=<timestamp>,v1=<hmac>
    const parts = input.signature.split(',');
    let ts: string | undefined;
    let v1: string | undefined;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') v1 = value;
    }

    if (!ts || !v1) {
      return { valid: false, reason: 'malformed_signature' };
    }

    // Construir signed string
    const signedString = `id:${input.dataId};request-id:${input.requestId};ts:${ts}`;

    const computed = createHmac('sha256', input.secret)
      .update(signedString)
      .digest('hex');

    if (computed !== v1) {
      this.logger.warn('Mercado Pago signature mismatch');
      return { valid: false, reason: 'invalid_signature' };
    }

    // Validar timestamp (max 5 min de diferencia)
    const now = Math.floor(Date.now() / 1000);
    const tsNum = parseInt(ts, 10);
    if (Math.abs(now - tsNum) > 300) {
      this.logger.warn('Mercado Pago signature expired (timestamp too old/new)');
      return { valid: false, reason: 'signature_expired' };
    }

    return { valid: true };
  }
}
