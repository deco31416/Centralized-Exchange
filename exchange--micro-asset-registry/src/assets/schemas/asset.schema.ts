import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssetType = 'fiat' | 'crypto' | 'internal';
export type AssetCategory =
    | 'CRYPTO'
    | 'FIAT'
    | 'STABLECOIN'
    | 'LAUNCHPAD'
    | 'INTERNAL';
export type KYCLevel = 'BASIC' | 'VERIFIED' | 'ADVANCED';

export class FiatMetadata {
    @Prop()
    isoCurrencyCode: string;

    @Prop({ type: [String] })
    countries: string[];

    @Prop()
    symbol: string;
}

export class CryptoMetadata {
    @Prop()
    coinId: string; // For Coingecko: 'bitcoin', 'ethereum'

    @Prop()
    contractAddress?: string; // For ERC20/TRC20 tokens

    @Prop({ type: [String] })
    networks: string[]; // Network codes: 'BTC', 'ERC20', 'TRC20'
}

@Schema({ timestamps: true, collection: 'assets' })
export class Asset extends Document {
    @Prop({ required: true, unique: true, uppercase: true })
    code: string; // USD, BTC, USDT

    @Prop({ required: true })
    name: string; // "US Dollar", "Bitcoin"

    @Prop({ required: true, enum: ['fiat', 'crypto', 'internal'] })
    type: AssetType;

    @Prop({ required: true, min: 0, max: 18 })
    decimals: number; // 2 for USD, 8 for BTC

    @Prop({ default: true })
    enabled: boolean;

    @Prop({ enum: ['CRYPTO', 'FIAT', 'STABLECOIN', 'LAUNCHPAD', 'INTERNAL'] })
    category?: AssetCategory;

    @Prop({ type: Number, default: 0 })
    minAmount: number; // Minor units

    @Prop({ type: Number, default: Number.MAX_SAFE_INTEGER })
    maxAmount: number; // Minor units

    // FIAT specific
    @Prop({ type: FiatMetadata, required: false })
    fiatMetadata?: FiatMetadata;

    // CRYPTO specific
    @Prop({ type: CryptoMetadata, required: false })
    cryptoMetadata?: CryptoMetadata;

    // Display & Discovery
    @Prop()
    description?: string;

    @Prop()
    iconUrl?: string; // Path relativo (/images/logos/coins/btc.svg) o URL absoluta (Cloudinary)

    @Prop()
    logoUrl?: string; // Alternativo de mayor resolución si existe

    // Operational flags (controlados desde admin)
    @Prop({ default: true })
    canBuy: boolean;

    @Prop({ default: true })
    canSell: boolean;

    @Prop({ default: true })
    canConvert: boolean;

    @Prop({ default: true })
    canSend: boolean;

    @Prop({ default: false })
    canWithdraw: boolean;

    @Prop({ default: false })
    canP2P: boolean;

    @Prop({ default: false })
    isInternal: boolean;

    @Prop({ default: false })
    isRepresentativeBalance: boolean;

    @Prop({ default: false })
    requiresComplianceReview: boolean;

    // Compliance
    @Prop({ default: false })
    requiresKYC: boolean;

    @Prop({ enum: ['BASIC', 'VERIFIED', 'ADVANCED'], default: 'BASIC' })
    level: KYCLevel;

    // ── Frontend visibility & catalog control ──────────────────────────────
    /** Controla si el activo aparece en la tab Wallet y catálogos del frontend. */
    @Prop({ default: true })
    isVisibleInFrontend: boolean;

    /** Orden de visualización en la UI (menor = primero). */
    @Prop({ type: Number, default: 0 })
    displayOrder: number;

    /** Badge opcional mostrado en la UI: "nuevo", "pronto", "fase 2", etc. */
    @Prop({ type: String, required: false })
    badge?: string;

    /** Fase de lanzamiento del activo. */
    @Prop({ enum: ['mvp', 'phase_2', 'blocked'], default: 'mvp' })
    rolloutPhase: 'mvp' | 'phase_2' | 'blocked';

    /**
     * Códigos de métodos de pago disponibles para este activo fiat.
     * Ej: ['spei', 'card', 'store', 'deposit', 'pix', 'pse', 'ach', 'sepa']
     * Solo aplica a activos tipo 'fiat'. Para crypto, queda vacío.
     */
    @Prop({ type: [String], default: [] })
    paymentMethods: string[];

    /**
     * Canales de recarga con datos de demostración para desarrollo.
     * Cada objeto describe un canal de pago: bank_transfer, mobile_payment, cash_reference.
     * Los datos de cuentas son DEMO (isTest: true, environment: 'development').
     * NO contienen información bancaria real ni datos personales reales.
     */
    @Prop({ type: [Object], default: [] })
    fundingChannels: Record<string, any>[];

    // Audit
    @Prop()
    createdBy: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

AssetSchema.index({ type: 1, enabled: 1 });
AssetSchema.index({ category: 1, enabled: 1 });
AssetSchema.index({ enabled: 1 });
AssetSchema.index({ isVisibleInFrontend: 1, enabled: 1 });
AssetSchema.index({ rolloutPhase: 1, enabled: 1 });
