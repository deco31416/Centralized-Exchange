import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { MockFundingMethodsAdapter } from '../adapters/mock-funding-methods.adapter';
import {
  FundingMethodSchemaClass,
  type FundingMethodDocument,
} from '../schemas/funding-method.schema';

/**
 * Al arrancar, si la colección funding_methods está vacía, la puebla
 * con el catálogo por defecto definido en MockFundingMethodsAdapter.
 * Si ya hay datos en DB, no toca nada — los datos en DB son la fuente de verdad.
 */
@Injectable()
export class FundingMethodsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FundingMethodsSeedService.name);

  constructor(
    @InjectModel(FundingMethodSchemaClass.name)
    private readonly model: Model<FundingMethodDocument>,
    private readonly mockAdapter: MockFundingMethodsAdapter,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.model.countDocuments().exec();
      if (count > 0) {
        this.logger.log(
          `[SEED] funding_methods ya tiene ${count} registros — no se sobreescribe.`,
        );
        return;
      }

      this.logger.log('[SEED] Colección vacía. Cargando catálogo por defecto...');
      const methods = await this.mockAdapter.listAllMethods();

      await this.model.insertMany(
        methods.map((m) => ({
          code: m.code,
          name: m.name,
          description: m.description,
          fiatCode: m.fiatCode ?? m.currency,
          currency: m.currency,
          country: m.country ?? '',
          type: m.type,
          minAmount: m.minAmount,
          maxAmount: m.maxAmount,
          requiresSavedCard: m.requiresSavedCard ?? false,
          requiresKyc: m.requiresKyc ?? false,
          settlementTime: m.settlementTime ?? '',
          instructions: m.instructions ?? '',
          iconUrl: m.iconUrl ?? '',
          isInternal: m.isInternal ?? false,
          isManualDeposit: m.isManualDeposit ?? false,
          adminEditable: m.adminEditable ?? true,
          enabled: m.enabled,
          disabledReason: m.disabledReason,
          displayOrder: m.displayOrder ?? 0,
          metadata: m.metadata ?? {},
        })),
      );

      this.logger.log(`[SEED] ${methods.length} métodos de fondeo insertados en MongoDB.`);
    } catch (err) {
      this.logger.error('[SEED] Error al seedear funding_methods:', err);
    }
  }
}
