import { SendDestinationType } from '../enums/send-destination-type.enum';
import { SendStatus } from '../enums/send-status.enum';

export class SendQuoteEntity {
  constructor(
    public readonly destinationType: SendDestinationType,
    public readonly amount: number,
    public readonly currency: string,
    public readonly fee: number,
    public readonly totalDebit: number,
    public readonly exchangeRate: number | null,
    public readonly estimatedDelivery: string,
    public readonly status: SendStatus = SendStatus.QUOTED,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}