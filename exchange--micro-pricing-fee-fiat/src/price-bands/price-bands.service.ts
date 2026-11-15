import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { PriceBand } from './schemas/price-band.schema';
import { EntropyEngineService, EntropySnapshot } from './entropy-engine.service';
import { CreatePriceBandDto } from './dto/create-price-band.dto';
import { UpdatePriceBandDto } from './dto/update-price-band.dto';

@Injectable()
export class PriceBandsService {
    private readonly logger = new Logger(PriceBandsService.name);

    constructor(
        @InjectModel(PriceBand.name) private bandModel: Model<PriceBand>,
        private readonly entropyEngine: EntropyEngineService,
    ) { }

    // ─── READ ────────────────────────────────────────────────────────

    /**
     * Get the active band for a pair+corridor.
     * Falls back to global pair band if no corridor-specific band exists.
     */
    async getBand(pairCode: string, corridorCode?: string): Promise<PriceBand | null> {
        const query: any = {
            pairCode: pairCode.toUpperCase(),
            enabled: true,
        };

        // Try corridor-specific band first
        if (corridorCode) {
            const specific = await this.bandModel
                .findOne({ ...query, corridorCode: corridorCode.toUpperCase() })
                .exec();
            if (specific) return specific;
        }

        // Fallback to global pair band
        return this.bandModel.findOne({ ...query, corridorCode: { $exists: false } }).exec();
    }

    /**
     * List all bands with optional filters.
     */
    async findAll(filters?: {
        pairCode?: string;
        alertLevel?: string;
        enabled?: boolean;
    }): Promise<PriceBand[]> {
        const query: any = {};
        if (filters?.pairCode) query.pairCode = filters.pairCode.toUpperCase();
        if (filters?.alertLevel) query.alertLevel = filters.alertLevel;
        if (filters?.enabled !== undefined) query.enabled = filters.enabled;
        return this.bandModel.find(query).sort({ pairCode: 1, corridorCode: 1 }).exec();
    }

    /**
     * Get a single band by ID.
     */
    async findById(id: string): Promise<PriceBand> {
        const band = await this.bandModel.findById(id).exec();
        if (!band) throw new NotFoundException(`Price band ${id} not found`);
        return band;
    }

    /**
     * Traffic-light dashboard: alert summary for all enabled bands.
     */
    async getAlerts(): Promise<any[]> {
        const bands = await this.bandModel.find({ enabled: true }).exec();
        return bands.map(b => ({
            pair: b.pairCode,
            corridor: b.corridorCode || 'GLOBAL',
            mode: b.mode,
            alertLevel: b.alertLevel,
            alertMessage: b.alertMessage,
            effectiveBuySpread: b.effectiveBuySpread,
            effectiveSellSpread: b.effectiveSellSpread,
            manualBuySpread: b.buySpreadPercentage,
            manualSellSpread: b.sellSpreadPercentage,
            entropyScore: b.entropy?.score ?? 0,
            entropyLevel: b.entropy?.level ?? 'LOW',
            entropyRecommendedBuy: b.entropy?.recommendedBuySpread ?? 0,
            entropyRecommendedSell: b.entropy?.recommendedSellSpread ?? 0,
            legalMaxUpper: b.legalMaxUpperPercentage,
            legalMaxLower: b.legalMaxLowerPercentage,
        }));
    }

    /**
     * Alert summary for a specific pair (all corridors).
     */
    async getAlertsForPair(pairCode: string): Promise<any[]> {
        const bands = await this.bandModel.find({
            pairCode: pairCode.toUpperCase(),
            enabled: true,
        }).exec();
        return bands.map(b => ({
            pair: b.pairCode,
            corridor: b.corridorCode || 'GLOBAL',
            mode: b.mode,
            alertLevel: b.alertLevel,
            alertMessage: b.alertMessage,
            effectiveBuySpread: b.effectiveBuySpread,
            effectiveSellSpread: b.effectiveSellSpread,
            entropyScore: b.entropy?.score ?? 0,
            entropyLevel: b.entropy?.level ?? 'LOW',
        }));
    }

    // ─── CREATE / UPDATE ─────────────────────────────────────────────

    /**
     * Create a new price band.
     */
    async create(dto: CreatePriceBandDto): Promise<PriceBand> {
        const existing = await this.bandModel.findOne({
            pairCode: dto.pairCode.toUpperCase(),
            ...(dto.corridorCode
                ? { corridorCode: dto.corridorCode.toUpperCase() }
                : { corridorCode: { $exists: false } }),
        }).exec();

        if (existing) {
            throw new BadRequestException(
                `Band already exists for ${dto.pairCode}${dto.corridorCode ? '/' + dto.corridorCode : ''}. Use PUT to update.`,
            );
        }

        // Calculate initial entropy
        const entropy = await this.entropyEngine.calculate(dto.pairCode);

        const band = new this.bandModel({
            pairCode: dto.pairCode.toUpperCase(),
            corridorCode: dto.corridorCode?.toUpperCase(),
            mode: dto.mode || 'MANUAL',
            buySpreadPercentage: dto.buySpreadPercentage,
            sellSpreadPercentage: dto.sellSpreadPercentage,
            legalMaxUpperPercentage: dto.legalMaxUpperPercentage,
            legalMaxLowerPercentage: dto.legalMaxLowerPercentage,
            enabled: dto.enabled ?? true,
            justification: dto.justification,
            approvedBy: dto.approvedBy,
            approvedAt: dto.approvedBy ? new Date() : undefined,
            entropy: entropy || {},
        });

        return band.save();
    }

    /**
     * Update an existing band (manual spreads, legal limits, etc.).
     */
    async update(id: string, dto: UpdatePriceBandDto): Promise<PriceBand> {
        const band = await this.findById(id);

        if (dto.buySpreadPercentage !== undefined) band.buySpreadPercentage = dto.buySpreadPercentage;
        if (dto.sellSpreadPercentage !== undefined) band.sellSpreadPercentage = dto.sellSpreadPercentage;
        if (dto.legalMaxUpperPercentage !== undefined) band.legalMaxUpperPercentage = dto.legalMaxUpperPercentage;
        if (dto.legalMaxLowerPercentage !== undefined) band.legalMaxLowerPercentage = dto.legalMaxLowerPercentage;
        if (dto.enabled !== undefined) band.enabled = dto.enabled;
        if (dto.justification !== undefined) band.justification = dto.justification;
        if (dto.approvedBy !== undefined) {
            band.approvedBy = dto.approvedBy;
            band.approvedAt = new Date();
        }

        return band.save(); // Pre-save hook recalculates effective spreads + alert
    }

    /**
     * Switch mode: MANUAL ↔ AUTO.
     *   MANUAL = admin sets spreads, entropy is just a dashboard indicator
     *   AUTO   = entropy engine controls spreads automatically
     * This is the "toma el control" button.
     */
    async switchMode(id: string, mode: 'MANUAL' | 'AUTO'): Promise<PriceBand> {
        const band = await this.findById(id);
        band.mode = mode;

        // If switching to AUTO, refresh entropy first
        if (mode === 'AUTO') {
            const entropy = await this.entropyEngine.calculate(band.pairCode);
            if (entropy) {
                band.entropy = entropy as any;
            }
        }

        return band.save(); // Pre-save hook recalculates effective spreads + alert
    }

    /**
     * Delete a price band.
     */
    async remove(id: string): Promise<void> {
        const result = await this.bandModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException(`Price band ${id} not found`);
    }

    /**
     * Legacy compatibility: upsert a band by pairCode+corridorCode.
     */
    async setBand(dto: Partial<PriceBand>): Promise<PriceBand> {
        const filter: any = { pairCode: dto.pairCode.toUpperCase() };
        if (dto.corridorCode) filter.corridorCode = dto.corridorCode.toUpperCase();
        else filter.corridorCode = { $exists: false };

        return this.bandModel.findOneAndUpdate(
            filter,
            { ...dto, updatedAt: new Date() },
            { upsert: true, new: true },
        ).exec();
    }

    // ─── Entropy Refresh (Cron) ──────────────────────────────────────

    /**
     * Runs at :15 and :45 of each minute (offset from price refresh at :00/:30).
     * Updates entropy indicators for all enabled bands.
     * In AUTO mode, this changes the effective spreads automatically.
     */
    @Cron('15,45 * * * * *')
    async refreshEntropy() {
        const bands = await this.bandModel.find({ enabled: true }).exec();
        if (bands.length === 0) return;

        // Deduplicate assets (multiple bands per asset possible)
        const uniquePairs = [...new Set(bands.map(b => b.pairCode))];
        const entropyCache = new Map<string, EntropySnapshot | null>();

        for (const pair of uniquePairs) {
            entropyCache.set(pair, await this.entropyEngine.calculate(pair));
        }

        for (const band of bands) {
            const entropy = entropyCache.get(band.pairCode);
            if (entropy) {
                band.entropy = entropy as any;
                await band.save(); // Pre-save recalculates effective + alert
                this.logger.debug(
                    `[Entropy] ${band.pairCode}${band.corridorCode ? '/' + band.corridorCode : ''}: ` +
                    `score=${entropy.score} (${entropy.level}), ` +
                    `mode=${band.mode}, ` +
                    `effective: buy=${band.effectiveBuySpread}% sell=${band.effectiveSellSpread}%, ` +
                    `alert=${band.alertLevel}`,
                );
            }
        }
    }
}
