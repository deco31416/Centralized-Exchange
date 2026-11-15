import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { P2PAssetCatalog, P2PAssetCatalogDocument } from './schemas/p2p-asset-catalog.schema';
import { P2P_ASSET_CATALOG_SEED } from './seeds/p2p-asset-catalog.seed';

@Injectable()
export class P2PAssetCatalogService {
  private readonly logger = new Logger(P2PAssetCatalogService.name);

  constructor(
    @InjectModel(P2PAssetCatalog.name)
    private readonly assetCatalogModel: Model<P2PAssetCatalogDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.upsertSeed();
  }

  /**
   * Upsert idempotente por assetCode (clave única).
   * - Crea nuevos activos si no existen
   * - Actualiza metadata existente (iconUrl, displayName, supportedFiatCodes, etc.)
   * - NUNCA duplica — safe para re-ejecutar en cada arranque
   */
  private async upsertSeed(): Promise<void> {
    let inserted = 0;
    let updated = 0;
    for (const item of P2P_ASSET_CATALOG_SEED) {
      const result = await this.assetCatalogModel.updateOne(
        { assetCode: item.assetCode },
        {
          $set: {
            displayName: item.displayName,
            description: item.description,
            iconUrl: item.iconUrl,
            enabled: item.enabled,
            supportedFiatCodes: item.supportedFiatCodes,
            minCryptoAmount: item.minCryptoAmount,
            maxCryptoAmount: item.maxCryptoAmount,
            requiresEscrow: item.requiresEscrow,
            sortOrder: item.sortOrder,
            comingSoon: item.comingSoon,
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount > 0) inserted++;
      else if (result.modifiedCount > 0) updated++;
    }
    this.logger.log(
      `[P2PAssetCatalog] Seed upsert completado — ${inserted} nuevos, ${updated} actualizados, ${P2P_ASSET_CATALOG_SEED.length} procesados`,
    );
  }

  /** Lista activos habilitados para P2P, opcionalmente filtrados por fiatCode soportado */
  async findEnabled(fiatCode?: string): Promise<P2PAssetCatalogDocument[]> {
    const filter: Record<string, unknown> = { enabled: true, comingSoon: false };
    if (fiatCode) {
      filter.supportedFiatCodes = fiatCode.toUpperCase();
    }
    return this.assetCatalogModel.find(filter).sort({ sortOrder: 1 }).lean() as unknown as P2PAssetCatalogDocument[];
  }

  /** Busca un activo por código */
  async findByCode(assetCode: string): Promise<P2PAssetCatalogDocument | null> {
    return this.assetCatalogModel
      .findOne({ assetCode: assetCode.toUpperCase() })
      .lean() as unknown as P2PAssetCatalogDocument | null;
  }

  /** Lista todos los activos (incluye deshabilitados — para admin) */
  async findAll(): Promise<P2PAssetCatalogDocument[]> {
    return this.assetCatalogModel.find().sort({ sortOrder: 1 }).lean() as unknown as P2PAssetCatalogDocument[];
  }
}
