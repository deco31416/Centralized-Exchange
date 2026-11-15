import { RemittanceStatus } from '../enums/remittance-status.enum';

export class RemittanceEntity {
  id: string;
  senderUserId: string;
  senderWalletId: string;
  senderName?: string;
  senderEmail?: string;

  receiverType: 'DECOX' | 'EXTERNAL';
  receiverUserId?: string;
  receiverIdentifier: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverPhone?: string;

  amountdeco: number;
  sourceCurrency: string;
  targetCurrency: string;
  targetAmount?: number;
  fxRate?: number;
  fee?: number;

  concept?: string;
  status: RemittanceStatus;

  reservationId?: string;
  captureId?: string;
  receiveCurrency?: string;

  createdAt: string;
  updatedAt: string;
  receivedAt?: string;
  cancelledAt?: string;

  constructor(partial: Partial<RemittanceEntity>) {
    Object.assign(this, partial);
  }
}