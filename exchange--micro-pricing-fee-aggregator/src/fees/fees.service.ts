import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeSchedule, FeeScope, OperationType } from './schemas/fee-schedule.schema';
import { CreateFeeScheduleDto } from './dto/create-fee-schedule.dto';
import { UpdateFeeScheduleDto } from './dto/update-fee-schedule.dto';

@Injectable()
export class FeesService {
    private readonly logger = new Logger(FeesService.name);

    constructor(
        @InjectModel(FeeSchedule.name) private feeModel: Model<FeeSchedule>,
    ) { }

    /**
     * Resolves the applicable fee schedule based on hierarchy:
     * 1. PAIR (most specific)
     * 2. ASSET
     * 3. NETWORK
     * 4. GLOBAL (least specific)
     */
    async resolveFee(
        operation: OperationType,
        assetCode: string,
        networkCode?: string,
        pairSecondAsset?: string,
    ): Promise<FeeSchedule | null> {
        const now = new Date();

        // Potentially matching scopes
        const query = {
            operation,
            enabled: true,
            $or: [
                { effectiveFrom: { $lte: now }, effectiveUntil: { $gte: now } },
                { effectiveFrom: { $lte: now }, effectiveUntil: { $exists: false } },
            ],
        };

        // We fetch candidates and filter in memory or via complex query. 
        // Hierarchy priority is numeric (1=High). Sort by priority ascending.

        // Let's look for specific matches first

        // 1. Check PAIR
        if (pairSecondAsset) {
            const pairFee = await this.feeModel.findOne({
                ...query,
                scope: FeeScope.PAIR,
                refIds: { $all: [assetCode, pairSecondAsset] } // Simplified logic
            }).exec();
            if (pairFee) return pairFee;
        }

        // 2. Check ASSET
        const assetFee = await this.feeModel.findOne({
            ...query,
            scope: FeeScope.ASSET,
            refIds: assetCode
        }).exec();
        if (assetFee) return assetFee;

        // 3. Check NETWORK
        if (networkCode) {
            const networkFee = await this.feeModel.findOne({
                ...query,
                scope: FeeScope.NETWORK,
                refIds: networkCode
            }).exec();
            if (networkFee) return networkFee;
        }

        // 4. Check GLOBAL
        const globalFee = await this.feeModel.findOne({
            ...query,
            scope: FeeScope.GLOBAL
        }).exec();

        return globalFee || null;
    }

    async createSchedule(data: Partial<FeeSchedule>): Promise<FeeSchedule> {
        const schedule = new this.feeModel(data);
        return schedule.save();
    }

    // ── Admin CRUD ────────────────────────────────────────────────────────────

    async findAll(enabled?: boolean): Promise<FeeSchedule[]> {
        const filter: Record<string, unknown> = {};
        if (enabled !== undefined) filter.enabled = enabled;
        return this.feeModel.find(filter).sort({ priority: 1, createdAt: -1 }).exec();
    }

    async findById(id: string): Promise<FeeSchedule> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`ID inválido: ${id}`);
        }
        const doc = await this.feeModel.findById(id).exec();
        if (!doc) {
            throw new NotFoundException(`FeeSchedule ${id} no encontrado`);
        }
        return doc;
    }

    async create(dto: CreateFeeScheduleDto): Promise<FeeSchedule> {
        const doc = new this.feeModel({
            ...dto,
            enabled: dto.enabled ?? true,
            refIds: dto.refIds ?? [],
            effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
            effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
        });
        return doc.save();
    }

    async update(id: string, dto: UpdateFeeScheduleDto): Promise<FeeSchedule> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`ID inválido: ${id}`);
        }
        const updates: Record<string, unknown> = { ...dto };
        if (dto.effectiveFrom !== undefined) updates.effectiveFrom = new Date(dto.effectiveFrom);
        if (dto.effectiveUntil !== undefined) updates.effectiveUntil = new Date(dto.effectiveUntil);

        const doc = await this.feeModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true },
        ).exec();

        if (!doc) throw new NotFoundException(`FeeSchedule ${id} no encontrado`);
        return doc;
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`ID inválido: ${id}`);
        }
        const result = await this.feeModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException(`FeeSchedule ${id} no encontrado`);
        return { deleted: true };
    }

    async setEnabled(id: string, enabled: boolean): Promise<FeeSchedule> {
        return this.update(id, { enabled });
    }
}
