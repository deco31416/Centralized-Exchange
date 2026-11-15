/**
 * Dominio: Transferencia FIAT genérica (provider-agnostic)
 */
export interface FiatTransfer {
  transferId: string; // UUID interno
  provider: string; // 'stp', 'banorte', 'mercadopago', 'stripe'
  providerTransferId: string; // ID del provider
  type: 'INBOUND' | 'OUTBOUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  currency: string; // 'MXN', 'USD', 'ARS', etc.
  amountMinorUnits: string; // Minor units (centavos)
  
  // Sender (para INBOUND)
  senderName?: string;
  senderAccount?: string;
  senderBankCode?: string;
  senderTaxId?: string; // RFC/CURP/CPF
  
  // Receiver (para OUTBOUND)
  receiverName?: string;
  receiverAccount?: string;
  receiverBankCode?: string;
  receiverTaxId?: string;
  
  // Tracking
  trackingCode?: string; // claveRastreo (SPEI), transaction_id (Stripe)
  referenceNumber?: string; // referencia numérica
  concept?: string; // Concepto de pago
  
  // Metadata
  rawPayload: Record<string, unknown>;
  receivedAt: Date;
  processedAt?: Date;
}

/**
 * Evento técnico: transferencia FIAT detectada
 * (custody-fiat → payments-core)
 */
export interface FiatTransferDetectedEvent {
  eventName: 'FIAT_TRANSFER_DETECTED';
  version: 'v1';
  correlationId: string;
  payload: {
    transferId: string;
    provider: string;
    providerTransferId: string;
    type: 'INBOUND' | 'OUTBOUND';
    currency: string;
    amountMinorUnits: string;
    trackingCode?: string;
    referenceNumber?: string;
    senderName?: string;
    senderAccount?: string;
    receiverName?: string;
    receiverAccount?: string;
    concept?: string;
    receivedAt: string; // ISO 8601
  };
}
