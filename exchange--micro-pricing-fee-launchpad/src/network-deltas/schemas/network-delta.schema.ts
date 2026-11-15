import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ─── Types ───────────────────────────────────────────────────────────

export type EmergencyStatus = 'INACTIVE' | 'ACTIVE' | 'PAUSED_NETWORK';

// ─── Sub-schemas ─────────────────────────────────────────────────────

export class ManualDeltaConfig {
    @Prop({ type: Number, default: 0 })
    deltaUsd: number; // Admin-set fixed delta (e.g., +0.10 for network cost)

    @Prop()
    reason: string; // "Operational cost coverage for ERC20"

    @Prop()
    setBy: string; // Admin user ID

    @Prop()
    setAt: Date;
}

export class EmergencyConfig {
    @Prop({ default: true })
    enabled: boolean;

    @Prop({ type: String, enum: ['INACTIVE', 'ACTIVE', 'PAUSED_NETWORK'], default: 'INACTIVE' })
    status: EmergencyStatus;

    @Prop({ type: Number, default: 0 })
    deltaUsd: number; // Emergency override delta

    @Prop({ type: Number, default: 5.00 })
    maxEmergencyDeltaUsd: number; // Cap for emergency delta

    @Prop({ default: true })
    autoPauseNetwork: boolean; // Auto-pause network on emergency?

    @Prop()
    activatedAt: Date;

    @Prop()
    activatedReason: string;

    @Prop()
    deactivatedAt: Date;
}

// ─── Main Schema ─────────────────────────────────────────────────────
//
// NetworkDelta = fixed/semi-static cost of using a blockchain network.
//   Manual: admin says "ERC20 costs $2, BSC costs $0.10"
//   Emergency: admin can activate emergency delta or pause a network.
//
// NOTE: Dynamic pricing (spreads based on market entropy) is handled
//       by the PriceBands module, NOT here.
//
// ─────────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'network_deltas' })
export class NetworkDelta extends Document {
    @Prop({ required: true, uppercase: true })
    assetCode: string; // BTC, USDT, ETH

    @Prop({ required: true, uppercase: true })
    networkCode: string; // BSC, TRC20, ERC20, SOL, LIGHTNING

    // ─── Layer 1: Manual (Admin) ──────────────────────────────────
    @Prop({ type: ManualDeltaConfig, default: () => ({}) })
    manual: ManualDeltaConfig;

    // ─── Layer 2: Emergency (Circuit Breaker) ─────────────────────
    @Prop({ type: EmergencyConfig, default: () => ({}) })
    emergency: EmergencyConfig;

    // ─── Computed Total ───────────────────────────────────────────
    @Prop({ type: Number, default: 0 })
    totalDeltaUsd: number; // manual + emergency

    // ─── Network Status ───────────────────────────────────────────
    @Prop({ default: false })
    networkPaused: boolean; // If true, transactions on this network are blocked

    @Prop()
    pauseReason: string;

    @Prop({ default: true })
    enabled: boolean;

    // ─── Audit ────────────────────────────────────────────────────
    @Prop({ type: [Object], default: [] })
    auditLog: Array<{
        action: string;
        field: string;
        oldValue: any;
        newValue: any;
        by: string;
        at: Date;
    }>;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const NetworkDeltaSchema = SchemaFactory.createForClass(NetworkDelta);

// ─── Indexes ─────────────────────────────────────────────────────────
NetworkDeltaSchema.index({ assetCode: 1, networkCode: 1 }, { unique: true });
NetworkDeltaSchema.index({ enabled: 1, networkPaused: 1 });
NetworkDeltaSchema.index({ 'emergency.status': 1 });

// ─── Pre-save: Recalculate totalDeltaUsd ─────────────────────────────
NetworkDeltaSchema.pre('save', function (next) {
    const doc = this as any;

    let total = 0;

    // Manual delta (always applied)
    total += doc.manual?.deltaUsd || 0;

    // Emergency delta (applied if active)
    if (doc.emergency?.status === 'ACTIVE' || doc.emergency?.status === 'PAUSED_NETWORK') {
        const emergencyDelta = doc.emergency?.deltaUsd || 0;
        const maxEmergency = doc.emergency?.maxEmergencyDeltaUsd ?? 5.00;
        total += Math.min(emergencyDelta, maxEmergency);
    }

    doc.totalDeltaUsd = Math.round(total * 100) / 100;
    next();
});
