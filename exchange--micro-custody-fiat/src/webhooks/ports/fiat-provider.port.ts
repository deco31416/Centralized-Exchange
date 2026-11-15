import { FiatTransfer } from '../../domain/fiat-transfer.types';

/**
 * Interfaz común para todos los providers FIAT
 * 
 * Cada provider (SPEI, Mercado Pago, Stripe, etc.) debe implementar
 * esta interfaz para garantizar consistencia en:
 * - Verificación de firmas
 * - Normalización de payloads
 * - Manejo de webhooks
 */
export interface FiatProviderPort {
  /**
   * Nombre único del provider (ej: 'stp', 'mercadopago', 'stripe')
   */
  readonly name: string;

  /**
   * Verifica la firma del webhook
   * 
   * @param payload - Payload del webhook (raw o parsed)
   * @param signature - Header de firma (ej: 'x-signature', 'stripe-signature')
   * @param secret - Secret del provider para verificación
   * @returns true si la firma es válida
   * @throws Error si la firma es inválida
   */
  verifySignature(payload: any, signature: string, secret: string): boolean;

  /**
   * Normaliza el payload del provider a FiatTransfer genérico
   * 
   * @param payload - Payload específico del provider
   * @returns FiatTransfer normalizado o null si no es procesable
   */
  normalize(payload: any): FiatTransfer | null;

  /**
   * Obtiene el idempotency key del payload
   * 
   * @param payload - Payload del webhook
   * @returns Clave única para deduplicación
   */
  getIdempotencyKey(payload: any): string;

  /**
   * Indica si el provider requiere raw body para verificación
   * (ej: Stripe necesita raw body, otros pueden usar JSON parsed)
   */
  readonly requiresRawBody: boolean;

  /**
   * Nombre del header donde viene la firma
   * (ej: 'x-signature', 'stripe-signature', etc.)
   */
  readonly signatureHeader: string;
}

/**
 * Resultado de procesamiento de webhook
 */
export interface WebhookProcessingResult {
  success: boolean;
  transferId?: string;
  error?: string;
  shouldRetry?: boolean;
}

/**
 * Configuración de provider
 */
export interface FiatProviderConfig {
  name: string;
  secret: string;
  enabled: boolean;
  // Configuración específica por provider (opcional)
  custom?: Record<string, any>;
}
