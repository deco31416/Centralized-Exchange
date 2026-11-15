import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NetworkDelta } from './schemas/network-delta.schema';
import { CreateNetworkDeltaDto } from './dto/create-network-delta.dto';
import { UpdateNetworkDeltaDto, PauseNetworkDto, DeactivateEmergencyDto } from './dto/update-network-delta.dto';

@Injectable()
export class NetworkDeltasService {
    private readonly logger = new Logger(NetworkDeltasService.name);

    constructor(
        @InjectModel(NetworkDelta.name) private deltaModel: Model<NetworkDelta>,
    ) { }

    // ─── READ Operations ─────────────────────────────────────────────

    /**
     * Get the delta for a specific pair+corridor.
     * This is what PricingService calls to apply corridor cost deltas.
     */
    async getDelta(pairCode: string, corridorCode: string): Promise<NetworkDelta | null> {
        const delta = await this.deltaModel
            .findOne({
                pairCode: pairCode.toUpperCase(),
                corridorCode: corridorCode.toUpperCase(),
                enabled: true,
            })
            .exec();

        if (delta?.networkPaused) {
            throw new BadRequestException(
                `Corridor ${corridorCode} is currently paused for ${pairCode}: ${delta.pauseReason || 'Emergency'}`,
            );
        }

        return delta;
    }

    /**
     * Get the total delta USD value for pricing calculations.
     * Returns 0 if no delta is configured (instead of throwing).
     */
    async getTotalDeltaUsd(pairCode: string, corridorCode: string): Promise<number> {
        const delta = await this.getDelta(pairCode, corridorCode);
        return delta?.totalDeltaUsd ?? 0;
    }

    /**
     * List all deltas, optionally filtered.
     */
    async findAll(filters?: { pairCode?: string; corridorCode?: string; enabled?: boolean }): Promise<NetworkDelta[]> {
        const query: any = {};

        if (filters?.pairCode) query.pairCode = filters.pairCode.toUpperCase();
        if (filters?.corridorCode) query.corridorCode = filters.corridorCode.toUpperCase();
        if (filters?.enabled !== undefined) query.enabled = filters.enabled;

        return this.deltaModel.find(query).sort({ pairCode: 1, corridorCode: 1 }).exec();
    }

    /**
     * Get a single delta by ID.
     */
    async findById(id: string): Promise<NetworkDelta> {
        const delta = await this.deltaModel.findById(id).exec();
        if (!delta) throw new NotFoundException(`Network delta ${id} not found`);
        return delta;
    }

    /**
     * Get all deltas that have emergency active.
     */
    async getActiveEmergencies(): Promise<NetworkDelta[]> {
        return this.deltaModel.find({
            'emergency.status': { $in: ['ACTIVE', 'PAUSED_NETWORK'] },
        }).exec();
    }

    // ─── CREATE / UPDATE Operations ──────────────────────────────────

    /**
     * Create a new network delta configuration.
     */
    async create(dto: CreateNetworkDeltaDto): Promise<NetworkDelta> {
        const existing = await this.deltaModel.findOne({
            pairCode: dto.pairCode.toUpperCase(),
            corridorCode: dto.corridorCode.toUpperCase(),
        }).exec();

        if (existing) {
            throw new BadRequestException(
                `Delta already exists for ${dto.pairCode}/${dto.corridorCode}. Use PUT to update.`,
            );
        }

        const delta = new this.deltaModel({
            pairCode: dto.pairCode.toUpperCase(),
            corridorCode: dto.corridorCode.toUpperCase(),
            manual: {
                deltaUsd: dto.manual.deltaUsd,
                reason: dto.manual.reason,
                setBy: dto.manual.setBy,
                setAt: new Date(),
            },
            emergency: {
                enabled: dto.emergencyConfig?.enabled ?? true,
                status: 'INACTIVE',
                deltaUsd: 0,
                maxEmergencyDeltaUsd: dto.emergencyConfig?.maxEmergencyDeltaUsd ?? 5.00,
                autoPauseNetwork: dto.emergencyConfig?.autoPauseNetwork ?? true,
            },
            auditLog: [{
                action: 'CREATED',
                field: 'all',
                oldValue: null,
                newValue: dto,
                by: dto.manual.setBy,
                at: new Date(),
            }],
        });

        return delta.save();
    }

    /**
     * Update a network delta (manual amount, emergency config).
     */
    async updateManualDelta(id: string, dto: UpdateNetworkDeltaDto): Promise<NetworkDelta> {
        const delta = await this.findById(id);

        const auditEntries: any[] = [];

        if (dto.manual?.deltaUsd !== undefined && dto.manual.deltaUsd !== delta.manual?.deltaUsd) {
            auditEntries.push({
                action: 'MANUAL_DELTA_UPDATED',
                field: 'manual.deltaUsd',
                oldValue: delta.manual?.deltaUsd,
                newValue: dto.manual.deltaUsd,
                by: dto.manual?.setBy || 'system',
                at: new Date(),
            });
            delta.manual.deltaUsd = dto.manual.deltaUsd;
        }

        if (dto.manual?.reason) delta.manual.reason = dto.manual.reason;
        if (dto.manual?.setBy) {
            delta.manual.setBy = dto.manual.setBy;
            delta.manual.setAt = new Date();
        }

        // Update emergency config if provided
        if (dto.emergencyConfig) {
            if (dto.emergencyConfig.enabled !== undefined) delta.emergency.enabled = dto.emergencyConfig.enabled;
            if (dto.emergencyConfig.maxEmergencyDeltaUsd !== undefined) delta.emergency.maxEmergencyDeltaUsd = dto.emergencyConfig.maxEmergencyDeltaUsd;
            if (dto.emergencyConfig.autoPauseNetwork !== undefined) delta.emergency.autoPauseNetwork = dto.emergencyConfig.autoPauseNetwork;
        }

        if (dto.enabled !== undefined) delta.enabled = dto.enabled;

        if (auditEntries.length > 0) {
            delta.auditLog.push(...auditEntries);
        }

        return delta.save();
    }

    /**
     * Delete a network delta by ID.
     */
    async remove(id: string): Promise<void> {
        const result = await this.deltaModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException(`Network delta ${id} not found`);
    }

    // ─── Corridor Pause Operations ────────────────────────────────────

    /**
     * Manually pause a corridor (admin action).
     */
    async pauseNetwork(id: string, dto: PauseNetworkDto): Promise<NetworkDelta> {
        const delta = await this.findById(id);
        delta.networkPaused = true;
        delta.pauseReason = dto.reason;
        delta.auditLog.push({
            action: 'NETWORK_PAUSED',
            field: 'networkPaused',
            oldValue: false,
            newValue: true,
            by: dto.pausedBy,
            at: new Date(),
        });
        return delta.save();
    }

    /**
     * Resume a paused corridor (admin action).
     */
    async resumeNetwork(id: string, resumedBy: string): Promise<NetworkDelta> {
        const delta = await this.findById(id);
        delta.networkPaused = false;
        delta.pauseReason = '';

        // Also deactivate emergency if it was the cause
        if (delta.emergency.status === 'PAUSED_NETWORK') {
            delta.emergency.status = 'INACTIVE';
            delta.emergency.deltaUsd = 0;
            delta.emergency.deactivatedAt = new Date();
        }

        delta.auditLog.push({
            action: 'NETWORK_RESUMED',
            field: 'networkPaused',
            oldValue: true,
            newValue: false,
            by: resumedBy,
            at: new Date(),
        });

        return delta.save();
    }

    // ─── Emergency Operations ────────────────────────────────────────

    /**
     * Manually activate an emergency (admin action).
     */
    async activateEmergency(id: string, dto: { deltaUsd: number; reason: string; activatedBy: string }): Promise<NetworkDelta> {
        const delta = await this.findById(id);

        if (!delta.emergency.enabled) {
            throw new BadRequestException('Emergency is disabled for this delta');
        }

        delta.emergency.status = delta.emergency.autoPauseNetwork ? 'PAUSED_NETWORK' : 'ACTIVE';
        delta.emergency.deltaUsd = Math.min(dto.deltaUsd, delta.emergency.maxEmergencyDeltaUsd || 5.00);
        delta.emergency.activatedAt = new Date();
        delta.emergency.activatedReason = dto.reason;

        if (delta.emergency.autoPauseNetwork) {
            delta.networkPaused = true;
            delta.pauseReason = `EMERGENCY: ${dto.reason}`;
        }

        delta.auditLog.push({
            action: 'EMERGENCY_ACTIVATED',
            field: 'emergency.status',
            oldValue: 'INACTIVE',
            newValue: delta.emergency.status,
            by: dto.activatedBy,
            at: new Date(),
        });

        return delta.save();
    }

    /**
     * Manually deactivate an emergency.
     */
    async deactivateEmergency(id: string, dto: DeactivateEmergencyDto): Promise<NetworkDelta> {
        const delta = await this.findById(id);

        if (delta.emergency.status === 'INACTIVE') {
            throw new BadRequestException('Emergency is not active');
        }

        delta.emergency.status = 'INACTIVE';
        delta.emergency.deltaUsd = 0;
        delta.emergency.deactivatedAt = new Date();

        // If network was auto-paused by emergency, resume it
        if (delta.networkPaused && delta.pauseReason?.includes('EMERGENCY')) {
            delta.networkPaused = false;
            delta.pauseReason = '';
        }

        delta.auditLog.push({
            action: 'EMERGENCY_DEACTIVATED',
            field: 'emergency.status',
            oldValue: delta.emergency.status,
            newValue: 'INACTIVE',
            by: dto.deactivatedBy,
            at: new Date(),
        });

        return delta.save();
    }
}
