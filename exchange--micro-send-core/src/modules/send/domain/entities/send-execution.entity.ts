import { SendDestinationType } from '../enums/send-destination-type.enum';
import { SendStatus } from '../enums/send-status.enum';

export class SendExecutionEntity {
  constructor(
    public readonly destinationType: SendDestinationType,
    public readonly operationId: string,
    public readonly status: SendStatus,
    public readonly amount: number,
    public readonly currency: string,
    public readonly fee: number,
    public readonly totalDebit: number,
    public readonly executedAt: string,
    public readonly providerReference?: string,
    public readonly message?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}