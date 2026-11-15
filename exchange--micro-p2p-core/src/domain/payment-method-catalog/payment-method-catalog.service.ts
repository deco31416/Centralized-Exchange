import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { P2PPaymentMethodCatalog, P2PPaymentMethodCatalogDocument } from './schemas/p2p-payment-method-catalog.schema';
import { PAYMENT_METHOD_CATALOG_SEED } from './seeds/catalog.seed';

@Injectable()
export class PaymentMethodCatalogService {
  private readonly logger = new Logger(PaymentMethodCatalogService.name);

  constructor(
    @InjectModel(P2PPaymentMethodCatalog.name)
    private readonly catalogModel: Model<P2PPaymentMethodCatalogDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.cleanOrphanDocs();
    await this.upsertSeed();
  }

  /**
   * Elimina documentos heredados del seed original que no tienen providerCode.
   * Esos docs son huérfanos del sistema anterior y no pueden ser actualizados por upsert.
   * Se ejecuta una sola vez (cuando ya no queden docs sin providerCode, el deleteMany no hace nada).
   *
   * // Temporary migration cleanup for pre-providerCode seed records.
   * // Safe because catalog seed now requires providerCode.
   * // Remove after production DBs are migrated.
   */
  private async cleanOrphanDocs(): Promise<void> {
    const result = await this.catalogModel.deleteMany({
      $or: [{ providerCode: { $exists: false } }, { providerCode: null }, { providerCode: '' }],
    });
    if (result.deletedCount > 0) {
      this.logger.warn(`[Catalog] Eliminados ${result.deletedCount} docs huérfanos sin providerCode`);
    }
  }

  /**
   * Upsert idempotente del catálogo de métodos de pago.
   *
   * Clave de upsert: { country, currency, providerCode }
   * - Si el documento NO existe → se crea con catalogId UUID nuevo ($setOnInsert)
   * - Si ya existe → se actualiza metadata (name, description, iconUrl, instructions, etc.)
   * - NUNCA duplica entradas aunque se re-ejecute múltiples veces al arrancar
   *
   * Esto permite añadir nuevos países/métodos sin borrar ni duplicar los existentes.
   */
  private async upsertSeed(): Promise<void> {
    let inserted = 0;
    let updated = 0;
    for (const item of PAYMENT_METHOD_CATALOG_SEED) {
      const filter = {
        country: item.country,
        currency: item.currency,
        providerCode: item.providerCode,
      };
      const result = await this.catalogModel.updateOne(
        filter,
        {
          $setOnInsert: { catalogId: uuidv4() },
          $set: {
            methodType: item.methodType,
            name: item.name,
            displayName: item.displayName ?? item.name,
            description: item.description ?? '',
            enabled: item.enabled,
            requiresBankName: item.requiresBankName,
            requiresAccountNumber: item.requiresAccountNumber,
            requiresAccountHolder: item.requiresAccountHolder,
            requiresDocumentId: item.requiresDocumentId,
            instructions: item.instructions,
            iconUrl: item.iconUrl,
            sortOrder: item.sortOrder,
            adminEditable: item.adminEditable,
            comingSoon: item.comingSoon,
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount > 0) inserted++;
      else if (result.modifiedCount > 0) updated++;
    }
    this.logger.log(
      `[Catalog] Seed upsert completado — ${inserted} nuevos, ${updated} actualizados, ${PAYMENT_METHOD_CATALOG_SEED.length} procesados`,
    );
  }

  async findByCountryAndCurrency(country?: string, currency?: string) {
    const filter: Record<string, any> = { enabled: true };
    if (country) filter.country = country.toUpperCase();
    if (currency) filter.currency = currency.toUpperCase();
    return this.catalogModel.find(filter).sort({ country: 1, name: 1 }).lean();
  }

  async findAll() {
    return this.catalogModel.find().sort({ country: 1, methodType: 1 }).lean();
  }

  async findById(catalogId: string) {
    return this.catalogModel.findOne({ catalogId }).lean();
  }
}
