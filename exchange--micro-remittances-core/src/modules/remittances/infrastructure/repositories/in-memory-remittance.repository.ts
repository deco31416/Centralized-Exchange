import { Injectable } from '@nestjs/common';
import { RemittanceEntity } from '../../domain/entities/remittance.entity';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';

@Injectable()
export class InMemoryRemittanceRepository implements RemittanceRepositoryPort {
  private readonly remittances = new Map<string, RemittanceEntity>();

  async create(remittance: RemittanceEntity): Promise<RemittanceEntity> {
    this.remittances.set(remittance.id, remittance);
    return remittance;
  }

  async findById(id: string): Promise<RemittanceEntity | null> {
    return this.remittances.get(id) || null;
  }

  async findBySenderUserId(senderUserId: string): Promise<RemittanceEntity[]> {
    return Array.from(this.remittances.values())
      .filter((remittance) => remittance.senderUserId === senderUserId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findIncomingByReceiverIdentifier(
    receiverIdentifier: string,
    statuses?: RemittanceStatus[],
  ): Promise<RemittanceEntity[]> {
    return Array.from(this.remittances.values())
      .filter((remittance) => {
        const matchesReceiver =
          remittance.receiverIdentifier === receiverIdentifier;

        const matchesStatus =
          !statuses?.length || statuses.includes(remittance.status);

        return matchesReceiver && matchesStatus;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async update(remittance: RemittanceEntity): Promise<RemittanceEntity> {
    this.remittances.set(remittance.id, remittance);
    return remittance;
  }
}