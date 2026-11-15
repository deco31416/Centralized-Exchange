import { RemittanceEntity } from '../entities/remittance.entity';
import { RemittanceStatus } from '../enums/remittance-status.enum';

export const REMITTANCE_REPOSITORY = 'REMITTANCE_REPOSITORY';

export interface RemittanceRepositoryPort {
  create(remittance: RemittanceEntity): Promise<RemittanceEntity>;
  findById(id: string): Promise<RemittanceEntity | null>;
  findBySenderUserId(senderUserId: string): Promise<RemittanceEntity[]>;
  findIncomingByReceiverIdentifier(
    receiverIdentifier: string,
    statuses?: RemittanceStatus[],
  ): Promise<RemittanceEntity[]>;
  update(remittance: RemittanceEntity): Promise<RemittanceEntity>;
}