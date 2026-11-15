import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ─── Types ───────────────────────────────────────────────────────────

export type PriceBandMode = 'MANUAL' | 'AUTO';
export type AlertLevel = 'SAFE' | 'WARNING' | 'DANGER' | 'BLOCKED';
export type EntropyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

// ─── Entropy Snapshot (always calculated, regardless of mode) ────────

export class EntropySnapshotEmbed {
    @Prop({ type: Number, default: 0 })
    score: number; // 0–1

    @Prop({ type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'], default: 'LOW' })
    level: EntropyLevel;

    @Prop({ type: Number, default: 0 })
    sourceVolatility: number;

    @Prop({ type: Number, default: 0 })
    rateChange24hPct: number;

    @Prop({ type: Number, default: 0 })
    recommendedBuySpread: number;

    @Prop({ type: Number, default: 0 })
    recommendedSellSpread: number;

    @Prop()
    calculatedAt: Date;
}

// ─── Main Schema ─────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'price_bands' })
export class PriceBand extends Document {
    @Prop({ required: true, uppercase: true })
    pairCode: string; // USD_COP, EUR_COP, USD_MXN

    @Prop({ uppercase: true })
    corridorCode?: string; // Optional: SWIFT, LOCAL, ACH, SEPA

    // ─── Mode ────────────────────────────────────────────────────
    //   MANUAL = admin sets spreads directly
    //   AUTO   = entropy engine controls spreads automatically
    @Prop({ type: String, enum: ['MANUAL', 'AUTO'], default: 'MANUAL' })
    mode: PriceBandMode;

    // ─── Manual Spreads (admin-set) ──────────────────────────────
    @Prop({ type: Number, required: true })
    buySpreadPercentage: number; // -0.5% → user buys at 99.5% of base rate

    @Prop({ type: Number, required: true })
    sellSpreadPercentage: number; // +0.5% → user sells at 100.5% of base rate

    // ─── Entropy Indicator ───────────────────────────────────────
    //   Always calculated (even in MANUAL mode) as a dashboard indicator.
    //   In AUTO mode, these become the effective spreads.
    @Prop({ type: EntropySnapshotEmbed, default: () => ({}) })
    entropy: EntropySnapshotEmbed;

    // ─── Effective Spreads (actually applied values) ─────────────
    //   Pre-save hook computes these based on mode.
    @Prop({ type: Number, default: 0 })
    effectiveBuySpread: number;

    @Prop({ type: Number, default: 0 })
    effectiveSellSpread: number;

    // ─── Legal Compliance Limits ─────────────────────────────────
    @Prop({ type: Number, required: true })
    legalMaxUpperPercentage: number; // +3% absolute max sell spread (fiat)

    @Prop({ type: Number, required: true })
    legalMaxLowerPercentage: number; // -2% absolute max buy spread (fiat)

    // ─── Alert System (Traffic Light) ────────────────────────────
    //   🟢 SAFE    = < 33% of legal limit
    //   🟠 WARNING = 33–66% of legal limit
    //   🔴 DANGER  = > 66% of legal limit
    //   ⛔ BLOCKED = exceeds legal limit → clamped automatically
    @Prop({ type: String, enum: ['SAFE', 'WARNING', 'DANGER', 'BLOCKED'], default: 'SAFE' })
    alertLevel: AlertLevel;

    @Prop()
    alertMessage?: string;

    // ─── Status ──────────────────────────────────────────────────
    @Prop({ default: true })
    enabled: boolean;

    @Prop({ default: false })
    requiresJustification: boolean;

    @Prop()
    justification?: string;

    @Prop()
    approvedBy?: string;

    @Prop()
    approvedAt?: Date;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const PriceBandSchema = SchemaFactory.createForClass(PriceBand);

PriceBandSchema.index({ pairCode: 1, corridorCode: 1 }, { unique: true, sparse: true });
PriceBandSchema.index({ enabled: 1 });
PriceBandSchema.index({ alertLevel: 1 });

// ─── Pre-save: calculate effective spreads + alert level ─────────────

PriceBandSchema.pre('save', function (next) {
    const doc = this as any;

    // 1. Calculate effective spreads based on mode
    if (doc.mode === 'AUTO' && doc.entropy?.recommendedBuySpread !== undefined) {
        doc.effectiveBuySpread = doc.entropy.recommendedBuySpread;
        doc.effectiveSellSpread = doc.entropy.recommendedSellSpread;
    } else {
        // MANUAL mode or no entropy data → use admin-set spreads
        doc.effectiveBuySpread = doc.buySpreadPercentage;
        doc.effectiveSellSpread = doc.sellSpreadPercentage;
    }

    // 2. Clamp to legal limits (NEVER exceed, regardless of mode)
    const legalUpper = Math.abs(doc.legalMaxUpperPercentage || 3);
    const legalLower = Math.abs(doc.legalMaxLowerPercentage || 2);
    let wasBlocked = false;

    if (doc.effectiveSellSpread > legalUpper) {
        doc.effectiveSellSpread = legalUpper;
        wasBlocked = true;
    }
    if (Math.abs(doc.effectiveBuySpread) > legalLower) {
        doc.effectiveBuySpread = -legalLower;
        wasBlocked = true;
    }

    // 3. Calculate alert level (traffic light)
    const sellDeviation = Math.abs(doc.effectiveSellSpread);
    const buyDeviation = Math.abs(doc.effectiveBuySpread);
    const maxDeviation = Math.max(sellDeviation, buyDeviation);
    const legalLimit = Math.max(legalUpper, legalLower);
    const deviationRatio = legalLimit > 0 ? maxDeviation / legalLimit : 0;

    if (wasBlocked) {
        doc.alertLevel = 'BLOCKED';
        doc.alertMessage = `⛔ Spread clamped: requested value exceeded legal limit (${legalLimit}%)`;
    } else if (deviationRatio > 0.66) {
        doc.alertLevel = 'DANGER';
        doc.alertMessage = `🔴 Spread at ${(deviationRatio * 100).toFixed(0)}% of legal limit — review recommended`;
    } else if (deviationRatio > 0.33) {
        doc.alertLevel = 'WARNING';
        doc.alertMessage = `🟠 Spread at ${(deviationRatio * 100).toFixed(0)}% of legal limit`;
    } else {
        doc.alertLevel = 'SAFE';
        doc.alertMessage = `🟢 Spread within safe range (${(deviationRatio * 100).toFixed(0)}% of limit)`;
    }

    next();
});
