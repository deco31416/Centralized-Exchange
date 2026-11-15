import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomToken } from './schemas/custom-token.schema';
import { CustomTokenTicker } from './schemas/custom-token-ticker.schema';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { UpdatePriceDto } from './dto/update-price.dto';

@Injectable()
export class TokensService {
    private readonly logger = new Logger(TokensService.name);

    constructor(
        @InjectModel(CustomToken.name) private tokenModel: Model<CustomToken>,
        @InjectModel(CustomTokenTicker.name) private tickerModel: Model<CustomTokenTicker>,
    ) { }

    // ─── READ ────────────────────────────────────────────────────────

    async findAll(filters?: { category?: string; pricingModel?: string; enabled?: boolean }): Promise<CustomToken[]> {
        const query: any = {};
        if (filters?.category) query.category = filters.category.toUpperCase();
        if (filters?.pricingModel) query.pricingModel = filters.pricingModel.toUpperCase();
        if (filters?.enabled !== undefined) query.enabled = filters.enabled;
        return this.tokenModel.find(query).sort({ tokenCode: 1 }).exec();
    }

    async findByCode(tokenCode: string): Promise<CustomToken> {
        const token = await this.tokenModel.findOne({ tokenCode: tokenCode.toUpperCase() }).exec();
        if (!token) throw new NotFoundException(`Token ${tokenCode} not found`);
        return token;
    }

    async findEnabled(): Promise<CustomToken[]> {
        return this.tokenModel.find({ enabled: true }).sort({ tokenCode: 1 }).exec();
    }

    async findByPricingModel(model: string): Promise<CustomToken[]> {
        return this.tokenModel.find({ pricingModel: model.toUpperCase(), enabled: true }).exec();
    }

    // ─── CREATE ──────────────────────────────────────────────────────

    async create(dto: CreateTokenDto): Promise<CustomToken> {
        const existing = await this.tokenModel.findOne({ tokenCode: dto.tokenCode.toUpperCase() }).exec();
        if (existing) {
            throw new BadRequestException(`Token ${dto.tokenCode} already exists. Use PUT to update.`);
        }

        // Validate required config based on pricing model
        if (dto.pricingModel === 'PEGGED' && (!dto.pegConfig || !dto.pegConfig.pegType || dto.pegConfig.pegType === 'NONE')) {
            throw new BadRequestException('PEGGED model requires pegConfig with a valid pegType (USD, BTC, ETH, etc.)');
        }
        if (dto.pricingModel === 'SIMULATED' && dto.currentPriceUsd <= 0) {
            throw new BadRequestException('SIMULATED model requires a positive currentPriceUsd as initial price');
        }

        // Set simulation initial price if model is SIMULATED
        const simConfig = dto.simulationConfig || {};
        if (dto.pricingModel === 'SIMULATED') {
            simConfig['initialPrice'] = dto.currentPriceUsd;
        }

        const token = new this.tokenModel({
            tokenCode: dto.tokenCode.toUpperCase(),
            name: dto.name,
            category: dto.category || 'ALTCOIN',
            description: dto.description,
            iconUrl: dto.iconUrl,
            pricingModel: dto.pricingModel,
            pegConfig: dto.pricingModel === 'PEGGED' ? dto.pegConfig : undefined,
            simulationConfig: dto.pricingModel === 'SIMULATED' ? simConfig : undefined,
            volatilityProfile: dto.volatilityProfile,
            currentPriceUsd: dto.currentPriceUsd,
            priceFloorUsd: dto.priceFloorUsd || 0,
            priceCeilingUsd: dto.priceCeilingUsd || 0,
            totalSupply: dto.totalSupply || 0,
            circulatingSupply: dto.circulatingSupply || 0,
            supportedNetworks: dto.supportedNetworks || ['INTERNAL'],
            enabled: dto.enabled ?? true,
            listedAt: new Date(),
            lastPriceUpdateBy: dto.createdBy || 'system',
            lastPriceUpdateAt: new Date(),
        });

        const saved = await token.save();

        // Create initial ticker entry (pass supply to avoid extra DB read)
        await this.createTickerEntry(saved.tokenCode, saved.currentPriceUsd, 'ADMIN', dto.createdBy || 'system', 'Initial listing', saved.circulatingSupply || 0);

        this.logger.log(`🪙 Token listed: ${saved.tokenCode} ($${saved.currentPriceUsd}) model=${saved.pricingModel}`);
        return saved;
    }

    // ─── UPDATE ──────────────────────────────────────────────────────

    async update(tokenCode: string, dto: UpdateTokenDto): Promise<CustomToken> {
        const token = await this.findByCode(tokenCode);

        if (dto.name !== undefined) token.name = dto.name;
        if (dto.category !== undefined) token.category = dto.category as any;
        if (dto.description !== undefined) token.description = dto.description;
        if (dto.iconUrl !== undefined) token.iconUrl = dto.iconUrl;
        if (dto.pricingModel !== undefined) token.pricingModel = dto.pricingModel as any;
        if (dto.pegConfig !== undefined) token.pegConfig = { ...token.pegConfig, ...dto.pegConfig } as any;
        if (dto.simulationConfig !== undefined) token.simulationConfig = { ...token.simulationConfig, ...dto.simulationConfig } as any;
        if (dto.volatilityProfile !== undefined) token.volatilityProfile = { ...token.volatilityProfile, ...dto.volatilityProfile } as any;
        if (dto.priceFloorUsd !== undefined) token.priceFloorUsd = dto.priceFloorUsd;
        if (dto.priceCeilingUsd !== undefined) token.priceCeilingUsd = dto.priceCeilingUsd;
        if (dto.totalSupply !== undefined) token.totalSupply = dto.totalSupply;
        if (dto.circulatingSupply !== undefined) token.circulatingSupply = dto.circulatingSupply;
        if (dto.supportedNetworks !== undefined) token.supportedNetworks = dto.supportedNetworks;
        if (dto.enabled !== undefined) {
            token.enabled = dto.enabled;
            if (!dto.enabled) token.delistedAt = new Date();
        }

        this.logger.log(`📝 Token updated: ${token.tokenCode} by ${dto.updatedBy || 'system'}`);
        return token.save();
    }

    // ─── PRICE UPDATE (most frequent operation) ──────────────────────

    /**
     * Directly update a token's price. Available for ALL pricing models.
     * For MANUAL tokens: this is the primary way to change price.
     * For PEGGED/SIMULATED: this is an admin override.
     */
    async updatePrice(tokenCode: string, dto: UpdatePriceDto): Promise<CustomToken> {
        const token = await this.findByCode(tokenCode);

        const oldPrice = token.currentPriceUsd;

        // Apply floor/ceiling
        let newPrice = dto.priceUsd;
        if (token.priceFloorUsd > 0 && newPrice < token.priceFloorUsd) {
            newPrice = token.priceFloorUsd;
            this.logger.warn(`⚠️ ${tokenCode}: Price clamped to floor $${token.priceFloorUsd}`);
        }
        if (token.priceCeilingUsd > 0 && newPrice > token.priceCeilingUsd) {
            newPrice = token.priceCeilingUsd;
            this.logger.warn(`⚠️ ${tokenCode}: Price clamped to ceiling $${token.priceCeilingUsd}`);
        }

        token.currentPriceUsd = newPrice;
        token.lastPriceUpdateBy = dto.changedBy;
        token.lastPriceUpdateAt = new Date();

        await token.save();

        // Record ticker entry (pass supply to avoid extra DB read)
        await this.createTickerEntry(
            token.tokenCode,
            newPrice,
            'ADMIN',
            dto.changedBy,
            dto.reason || `Price changed from $${oldPrice} to $${newPrice}`,
            token.circulatingSupply || 0,
        );

        this.logger.log(`💰 ${tokenCode}: $${oldPrice} → $${newPrice} by ${dto.changedBy}`);
        return token;
    }

    /**
     * Internal method to update price (used by peg sync and simulation engine).
     * Bypasses admin auth — only called by internal services.
     */
    async updatePriceInternal(
        tokenCode: string,
        priceUsd: number,
        source: 'PEG_SYNC' | 'SIMULATION' | 'INTERNAL',
        reason?: string,
        metadata?: Record<string, any>,
    ): Promise<void> {
        const token = await this.tokenModel.findOne({ tokenCode: tokenCode.toUpperCase() }).exec();
        if (!token) return;

        // Apply floor/ceiling
        let finalPrice = priceUsd;
        if (token.priceFloorUsd > 0) finalPrice = Math.max(finalPrice, token.priceFloorUsd);
        if (token.priceCeilingUsd > 0) finalPrice = Math.min(finalPrice, token.priceCeilingUsd);

        token.currentPriceUsd = finalPrice;
        token.lastPriceUpdateBy = 'system';
        token.lastPriceUpdateAt = new Date();
        await token.save();

        // Calculate 24h change from ticker history
        const priceChange24h = await this.calculate24hChange(tokenCode, finalPrice);

        await this.tickerModel.create({
            tokenCode: tokenCode.toUpperCase(),
            priceUsd: finalPrice,
            source,
            changedBy: 'system',
            changeReason: reason,
            priceChange24h,
            volume24h: 0, // Will be updated by internal order engine integration
            marketCap: finalPrice * (token.circulatingSupply || 0),
            simulationTrend: metadata?.trend,
            simulationDrift: metadata?.drift,
            pegReferencePrice: metadata?.pegReferencePrice,
            pegDeviation: metadata?.pegDeviation,
        });
    }

    // ─── DELETE / DELIST ──────────────────────────────────────────────

    async remove(tokenCode: string): Promise<void> {
        const token = await this.findByCode(tokenCode);
        token.enabled = false;
        token.delistedAt = new Date();
        await token.save();
        this.logger.log(`🚫 Token delisted: ${tokenCode}`);
    }

    // ─── TICKER QUERIES ──────────────────────────────────────────────

    async getLatestTicker(tokenCode: string): Promise<CustomTokenTicker | null> {
        return this.tickerModel
            .findOne({ tokenCode: tokenCode.toUpperCase() })
            .sort({ createdAt: -1 })
            .exec();
    }

    async getAllLatestTickers(): Promise<CustomTokenTicker[]> {
        // Aggregation pipeline: get the latest ticker per tokenCode in a single query
        const results = await this.tickerModel.aggregate([
            { $sort: { tokenCode: 1, createdAt: -1 } },
            {
                $group: {
                    _id: '$tokenCode',
                    doc: { $first: '$$ROOT' },
                },
            },
            { $replaceRoot: { newRoot: '$doc' } },
            { $sort: { tokenCode: 1 } },
        ]).exec();

        // Filter to only enabled tokens
        const enabledTokens = await this.findEnabled();
        const enabledCodes = new Set(enabledTokens.map(t => t.tokenCode));
        return results.filter(t => enabledCodes.has(t.tokenCode));
    }

    async getTickerHistory(tokenCode: string, limit = 100): Promise<CustomTokenTicker[]> {
        return this.tickerModel
            .find({ tokenCode: tokenCode.toUpperCase() })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    // ─── Peg Sync support ────────────────────────────────────────────

    async getPeggedTokens(): Promise<CustomToken[]> {
        return this.tokenModel.find({
            pricingModel: 'PEGGED',
            'pegConfig.pegType': { $ne: 'NONE' },
            enabled: true,
        }).exec();
    }

    async getSimulatedTokens(): Promise<CustomToken[]> {
        return this.tokenModel.find({
            pricingModel: 'SIMULATED',
            'simulationConfig.enabled': true,
            enabled: true,
        }).exec();
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private async createTickerEntry(
        tokenCode: string,
        priceUsd: number,
        source: string,
        changedBy: string,
        reason: string,
        circulatingSupply?: number,
    ): Promise<void> {
        const priceChange24h = await this.calculate24hChange(tokenCode, priceUsd);

        // If circulatingSupply not passed, read from DB (fallback)
        let supply = circulatingSupply;
        if (supply === undefined) {
            const token = await this.tokenModel.findOne({ tokenCode }).exec();
            supply = token?.circulatingSupply || 0;
        }

        await this.tickerModel.create({
            tokenCode,
            priceUsd,
            source,
            changedBy,
            changeReason: reason,
            priceChange24h,
            volume24h: 0,
            marketCap: priceUsd * supply,
        });
    }

    private async calculate24hChange(tokenCode: string, currentPrice: number): Promise<number> {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oldTicker = await this.tickerModel
            .findOne({ tokenCode: tokenCode.toUpperCase(), createdAt: { $lte: oneDayAgo } })
            .sort({ createdAt: -1 })
            .exec();

        if (!oldTicker || oldTicker.priceUsd === 0) return 0;
        return ((currentPrice - oldTicker.priceUsd) / oldTicker.priceUsd) * 100;
    }
}
