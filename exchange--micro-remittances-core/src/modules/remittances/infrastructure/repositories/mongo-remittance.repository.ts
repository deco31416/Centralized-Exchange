import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RemittanceEntity } from '../../domain/entities/remittance.entity';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';
import {
    RemittanceDocument,
    RemittanceModel,
} from './remittance.schema';

@Injectable()
export class MongoRemittanceRepository implements RemittanceRepositoryPort {
    constructor(
        @InjectModel(RemittanceModel.name)
        private readonly remittanceModel: Model<RemittanceDocument>,
    ) { }

    async create(remittance: RemittanceEntity): Promise<RemittanceEntity> {
        const created = await this.remittanceModel.create(remittance);
        return this.toEntity(created);
    }

    async findById(id: string): Promise<RemittanceEntity | null> {
        const doc = await this.remittanceModel.findOne({ id }).lean();
        return doc ? this.toEntity(doc) : null;
    }

    async findBySenderUserId(senderUserId: string): Promise<RemittanceEntity[]> {
        const docs = await this.remittanceModel
            .find({ senderUserId })
            .sort({ createdAt: -1 })
            .lean();

        return docs.map((doc) => this.toEntity(doc));
    }

    async findIncomingByReceiverIdentifier(
        receiverIdentifier: string,
        statuses?: RemittanceStatus[],
    ): Promise<RemittanceEntity[]> {
        const filter: Record<string, unknown> = {
            receiverIdentifier,
        };

        if (statuses?.length) {
            filter.status = { $in: statuses };
        }

        const docs = await this.remittanceModel
            .find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return docs.map((doc) => this.toEntity(doc));
    }

    async update(remittance: RemittanceEntity): Promise<RemittanceEntity> {
        const updated = await this.remittanceModel
            .findOneAndUpdate({ id: remittance.id }, remittance, {
                new: true,
                upsert: false,
            })
            .lean();

        if (!updated) {
            throw new Error(`No se encontró la remesa con id ${remittance.id} para actualizar`);
        }

        return this.toEntity(updated);
    }

    private toEntity(doc: Partial<RemittanceModel>): RemittanceEntity {
        return new RemittanceEntity({
            id: doc.id,
            senderUserId: doc.senderUserId,
            senderWalletId: doc.senderWalletId,
            senderName: doc.senderName,
            senderEmail: doc.senderEmail,
            receiverType: doc.receiverType,
            receiverUserId: doc.receiverUserId,
            receiverIdentifier: doc.receiverIdentifier,
            receiverName: doc.receiverName,
            receiverEmail: doc.receiverEmail,
            receiverPhone: doc.receiverPhone,
            amountdeco: doc.amountdeco,
            sourceCurrency: doc.sourceCurrency,
            targetCurrency: doc.targetCurrency,
            targetAmount: doc.targetAmount,
            fxRate: doc.fxRate,
            fee: doc.fee,
            concept: doc.concept,
            status: doc.status,
            reservationId: doc.reservationId,
            captureId: doc.captureId,
            receiveCurrency: doc.receiveCurrency,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            receivedAt: doc.receivedAt,
            cancelledAt: doc.cancelledAt,
        });
    }
}