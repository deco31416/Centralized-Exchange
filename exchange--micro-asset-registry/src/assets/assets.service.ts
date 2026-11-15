import { Injectable, NotFoundException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset } from './schemas/asset.schema';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { ASSET_SEEDS } from './seeds/asset-seeds.data';

const STABLECOIN_CODES = new Set(['USD', 'USDT', 'USDC']);
const LAUNCHPAD_COINIDS = new Set([
    'DECOX-token', 'DECOX-coin', 'deco-token', 'gold-dollar',
]);

@Injectable()
export class AssetsService implements OnModuleInit {
    private readonly logger = new Logger(AssetsService.name);

    constructor(
        @InjectModel(Asset.name) private assetModel: Model<Asset>,
    ) { }

    /**
     * One-time migration: sets `category` field for existing assets.
     * Runs on startup, idempotent — only touches docs without category.
     */
    async onModuleInit() {
        await this.migrateCategories();
        await this.seedDefaultAssets();
    }

    private async migrateCategories() {
        const assetsWithoutCategory = await this.assetModel
            .find({ category: { $exists: false } })
            .exec();

        if (assetsWithoutCategory.length === 0) return;

        this.logger.log(`[Migration] Setting category for ${assetsWithoutCategory.length} assets...`);

        for (const asset of assetsWithoutCategory) {
            let category: string;

            if (STABLECOIN_CODES.has(asset.code)) {
                category = 'STABLECOIN';
            } else if (asset.type === 'internal' || asset.isInternal) {
                category = 'INTERNAL';
            } else if (asset.type === 'fiat') {
                category = 'FIAT';
            } else if (
                asset.type === 'crypto' &&
                asset.cryptoMetadata?.coinId &&
                LAUNCHPAD_COINIDS.has(asset.cryptoMetadata.coinId)
            ) {
                category = 'LAUNCHPAD';
            } else {
                category = 'CRYPTO';
            }

            await this.assetModel.updateOne(
                { _id: asset._id },
                { $set: { category } },
            );
            this.logger.log(`  ✅ ${asset.code} → ${category}`);
        }

        this.logger.log(`[Migration] Done.`);
    }

    /**
     * Backfill: crea o actualiza metadata ligera para los 22 assets base del ecosistema.
     * - Si el asset no existe: lo crea con todos los campos.
     * - Si ya existe: actualiza SOLO iconUrl/logoUrl/description/canBuy/canSell/canConvert/canSend/category
     *   usando $setOnInsert para campos estructurales y $set para metadata visual.
     * Idempotente: safe para correr en cada arranque.
     */
    private async seedDefaultAssets() {
        this.logger.log('[Seed] Iniciando backfill de 22 assets base...');
        let count = 0;

        for (const seed of ASSET_SEEDS) {
            const {
                code,
                iconUrl, logoUrl, description,
                canBuy, canSell, canConvert, canSend,
                category,
                // Catalog-control: deben actualizarse en cada run (van a $set)
                isVisibleInFrontend, displayOrder, rolloutPhase, badge,
                enabled, paymentMethods, fundingChannels,
                // Resto estructural: solo al crear (va a $setOnInsert)
                ...rest
            } = seed;

            // $setOnInsert: campos inmutables que solo se aplican al crear el doc (type, decimals, networks, etc.)
            // $set: metadata visual + catalog-control — se actualiza siempre para que el seed sea fuente de verdad
            await this.assetModel.findOneAndUpdate(
                { code: code.toUpperCase() },
                {
                    $setOnInsert: { code: code.toUpperCase(), ...rest },
                    $set: {
                        category,
                        enabled: enabled ?? true,
                        isVisibleInFrontend: isVisibleInFrontend ?? false,
                        ...(displayOrder !== undefined && { displayOrder }),
                        ...(rolloutPhase !== undefined && { rolloutPhase }),
                        ...(badge !== undefined && { badge }),
                        ...(paymentMethods !== undefined && { paymentMethods }),
                        ...(fundingChannels !== undefined && { fundingChannels }),
                        ...(description !== undefined && { description }),
                        ...(iconUrl !== null && { iconUrl }),
                        ...(logoUrl !== null && { logoUrl }),
                        canBuy,
                        canSell,
                        canConvert,
                        canSend,
                    },
                },
                { upsert: true, new: true },
            ).exec();

            count++;
        }

        this.logger.log(`[Seed] Backfill completado → ${count} assets procesados`);
    }

    async create(createAssetDto: CreateAssetDto): Promise<Asset> {
        // Normalize code to uppercase
        const normalizedDto = {
            ...createAssetDto,
            code: createAssetDto.code.toUpperCase(),
        };

        // Validate: FIAT must have fiatMetadata
        if (normalizedDto.type === 'fiat' && !normalizedDto.fiatMetadata) {
            throw new BadRequestException('FIAT assets must include fiatMetadata');
        }

        // Validate: CRYPTO must have cryptoMetadata
        if (normalizedDto.type === 'crypto' && !normalizedDto.cryptoMetadata) {
            throw new BadRequestException('CRYPTO assets must include cryptoMetadata');
        }

        try {
            const asset = new this.assetModel(normalizedDto);
            return await asset.save();
        } catch (error: any) {
            if (error.code === 11000) {
                throw new BadRequestException(`Asset with code ${normalizedDto.code} already exists`);
            }
            throw error;
        }
    }

    async findAll(filters?: { type?: string; enabled?: boolean }): Promise<Asset[]> {
        const query: any = {};

        if (filters?.type) {
            query.type = filters.type;
        }

        if (filters?.enabled !== undefined) {
            query.enabled = filters.enabled;
        }

        return this.assetModel.find(query).sort({ displayOrder: 1, code: 1 }).exec();
    }

    /**
     * Activos visibles en el frontend, agrupados por tipo.
     * Solo devuelve assets donde enabled=true e isVisibleInFrontend=true.
     */
    async findGroupedForFrontend(): Promise<{
        fiat: Asset[];
        crypto: Asset[];
        internal: Asset[];
    }> {
        const assets = await this.assetModel
            .find({ enabled: true, isVisibleInFrontend: true })
            .sort({ displayOrder: 1, code: 1 })
            .exec();

        return {
            fiat: assets.filter((a) => a.type === 'fiat'),
            crypto: assets.filter((a) => a.type === 'crypto' && !a.isInternal),
            internal: assets.filter((a) => a.type === 'internal' || (a.type === 'crypto' && a.isInternal)),
        };
    }

    /**
     * Lista plana de activos visibles en el frontend.
     * Parámetro opcional type: 'fiat' | 'crypto' | 'internal'
     */
    async findForFrontend(type?: string): Promise<Asset[]> {
        const query: any = { enabled: true, isVisibleInFrontend: true };
        if (type) query.type = type;
        return this.assetModel.find(query).sort({ displayOrder: 1, code: 1 }).exec();
    }

    /**
     * Todos los activos (admin view), incluyendo los no visibles en frontend.
     * Solo requiere InternalAuthGuard.
     */
    async findAllForAdmin(): Promise<Asset[]> {
        return this.assetModel.find().sort({ type: 1, displayOrder: 1, code: 1 }).exec();
    }

    async findOne(code: string): Promise<Asset> {
        const asset = await this.assetModel.findOne({ code: code.toUpperCase() }).exec();

        if (!asset) {
            throw new NotFoundException(`Asset with code ${code} not found`);
        }

        return asset;
    }

    async update(code: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
        const asset = await this.assetModel
            .findOneAndUpdate(
                { code: code.toUpperCase() },
                { $set: updateAssetDto },
                { new: true }
            )
            .exec();

        if (!asset) {
            throw new NotFoundException(`Asset with code ${code} not found`);
        }

        return asset;
    }

    async enable(code: string): Promise<Asset> {
        return this.update(code, { enabled: true });
    }

    async disable(code: string): Promise<Asset> {
        return this.update(code, { enabled: false });
    }

    async delete(code: string): Promise<void> {
        const result = await this.assetModel.deleteOne({ code: code.toUpperCase() }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`Asset with code ${code} not found`);
        }
    }
}
