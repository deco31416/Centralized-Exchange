/**
 * Evento recibido desde custody-fiat
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
    receivedAt: string;
  };
}

/**
 * Evento emitido hacia wallet-ledger-core
 */
export interface FiatDepositConfirmedEvent {
  eventName: 'FIAT_DEPOSIT_CONFIRMED';
  version: 'v1';
  correlationId: string;
  payload: {
    eventId: string;
    userId: string;
    currency: string;
    amountMinorUnits: string;
    transferId: string;
    provider: string;
    providerTransferId: string;
    trackingCode?: string;
    externalRef?: {
      senderName?: string;
      senderAccount?: string;
      concept?: string;
    };
  };
}
