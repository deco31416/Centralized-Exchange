import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { FundingMethodsPort } from '../../application/ports/funding-methods.port';
import type { FundingMethodEntity } from '../../domain/entities/funding-method.entity';
import {
  FundingMethodSchemaClass,
  type FundingMethodDocument,
} from '../schemas/funding-method.schema';

@Injectable()
export class MongoFundingMethodsRepository implements FundingMethodsPort {
  constructor(
    @InjectModel(FundingMethodSchemaClass.name)
    private readonly model: Model<FundingMethodDocument>,
  ) {}

  async getAvailableMethods(filters?: {
    fiatCode?: string;
    countryCode?: string;
  }): Promise<FundingMethodEntity[]> {
    const query: Record<string, unknown> = { enabled: true };
    if (filters?.fiatCode) query['fiatCode'] = filters.fiatCode.toUpperCase();
    if (filters?.countryCode) query['country'] = filters.countryCode.toUpperCase();
    const docs = await this.model.find(query).sort({ displayOrder: 1 }).lean<FundingMethodSchemaClass[]>().exec();
    return docs.map((d) => this.toEntity(d));
  }

  async listAllMethods(): Promise<FundingMethodEntity[]> {
    const docs = await this.model.find({}).sort({ fiatCode: 1, displayOrder: 1 }).lean<FundingMethodSchemaClass[]>().exec();
    return docs.map((d) => this.toEntity(d));
  }

  async getMethodByCode(code: string): Promise<FundingMethodEntity | null> {
    const doc = await this.model.findOne({ code }).lean<FundingMethodSchemaClass>().exec();
    return doc ? this.toEntity(doc) : null;
  }

  async createMethod(method: FundingMethodEntity): Promise<FundingMethodEntity> {
    const created = await this.model.create(method);
    return this.toEntity(created.toObject() as unknown as FundingMethodSchemaClass);
  }

  async updateMethod(
    code: string,
    changes: Partial<FundingMethodEntity>,
  ): Promise<FundingMethodEntity | null> {
    const doc = await this.model
      .findOneAndUpdate({ code }, { $set: changes }, { new: true })
      .lean<FundingMethodSchemaClass>()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: FundingMethodSchemaClass): FundingMethodEntity {
    return {
      code: doc.code,
      methodCode: doc.code,
      name: doc.name,
      description: doc.description,
      fiatCode: doc.fiatCode,
      currency: doc.currency,
      country: doc.country,
      type: doc.type as FundingMethodEntity['type'],
      minAmount: doc.minAmount,
      maxAmount: doc.maxAmount,
      requiresSavedCard: doc.requiresSavedCard ?? false,
      requiresKyc: doc.requiresKyc ?? false,
      settlementTime: doc.settlementTime,
      instructions: doc.instructions,
      iconUrl: doc.iconUrl,
      isInternal: doc.isInternal ?? false,
      isManualDeposit: doc.isManualDeposit ?? false,
      adminEditable: doc.adminEditable ?? true,
      displayOrder: doc.displayOrder ?? 0,
      enabled: doc.enabled ?? true,
      disabledReason: doc.disabledReason,
      metadata: doc.metadata ?? {},
    };
  }
}
