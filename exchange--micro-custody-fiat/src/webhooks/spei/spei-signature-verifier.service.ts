import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

export interface SpeiWebhookPayload {
  // STP (Sistema de Transferencias y Pagos)
  id?: string;
  empresa?: string;
  fechaOperacion?: string;
  institucionOrdenante?: string;
  institucionBeneficiaria?: string;
  claveRastreo?: string;
  monto?: number;
  nombreOrdenante?: string;
  tipoCuentaOrdenante?: number;
  cuentaOrdenante?: string;
  rfcCurpOrdenante?: string;
  nombreBeneficiario?: string;
  tipoCuentaBeneficiario?: number;
  cuentaBeneficiario?: string;
  rfcCurpBeneficiario?: string;
  conceptoPago?: string;
  referenciaNumerica?: number;
  medioEntrega?: number;
  prioridad?: number;
  // Banorte similar pero puede variar
  folio?: string;
  amount?: number;
  currency?: string;
  // Genérico
  status?: string;
  type?: string;
}

@Injectable()
export class SpeiSignatureVerifier {
  private readonly logger = new Logger(SpeiSignatureVerifier.name);

  /**
   * Verifica firma HMAC-SHA256 de webhook SPEI.
   * 
   * STP: header `x-signature` con HMAC de payload serializado
   * Banorte: puede usar `x-banorte-signature` o similar
   * 
   * @param provider - 'stp' | 'banorte'
   * @param signature - Firma recibida en header
   * @param payload - Cuerpo del webhook
   * @param secret - Secret key del provider (desde env)
   */
  verify(input: {
    provider: string;
    signature: string | undefined;
    payload: Record<string, unknown>;
    secret: string | undefined;
  }): { valid: true } | { valid: false; reason: string } {
    // En dev/testing, si no hay secret configurado, bypass
    if (!input.secret) {
      this.logger.warn(`[${input.provider}] No secret configured, bypassing signature verification`);
      return { valid: true };
    }

    if (!input.signature) {
      return { valid: false, reason: 'missing_signature' };
    }

    const canonical = this.canonicalizePayload(input.provider, input.payload);
    const computed = createHmac('sha256', input.secret)
      .update(canonical)
      .digest('hex');

    if (computed !== input.signature) {
      this.logger.warn(`[${input.provider}] Signature mismatch`);
      return { valid: false, reason: 'invalid_signature' };
    }

    return { valid: true };
  }

  private canonicalizePayload(provider: string, payload: Record<string, unknown>): string {
    // STP: JSON stringify sin espacios
    if (provider === 'stp') {
      return JSON.stringify(payload);
    }

    // Banorte: puede requerir ordenamiento de keys
    if (provider === 'banorte') {
      const sorted = Object.keys(payload)
        .sort()
        .reduce((acc, key) => {
          acc[key] = payload[key];
          return acc;
        }, {} as Record<string, unknown>);
      return JSON.stringify(sorted);
    }

    // Default: JSON stringify
    return JSON.stringify(payload);
  }
}
