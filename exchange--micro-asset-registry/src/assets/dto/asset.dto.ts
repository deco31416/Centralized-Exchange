import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─────────────────────────────────────────────────────────────────────────────
// FundingChannelDto — Contrato HTTP para canales de fondeo
//
// Soporta dos modos de operación:
//   API_AUTOMATED       — integración automática por API / webhook del proveedor
//   MANUAL_CONFIRMATION — usuario transfiere, admin confirma manualmente
//
// Todos los campos son @IsOptional() para mantener compatibilidad con canales
// pre-existentes que no tengan `mode` u otros campos nuevos.
// ─────────────────────────────────────────────────────────────────────────────
export class FundingChannelDto {
    // ── Discriminador ──────────────────────────────────────────────────────────
    @IsEnum(['API_AUTOMATED', 'MANUAL_CONFIRMATION'])
    @IsOptional()
    mode?: 'API_AUTOMATED' | 'MANUAL_CONFIRMATION';

    // ── Identificación ─────────────────────────────────────────────────────────
    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsOptional()
    provider?: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    // ── Beneficiario ───────────────────────────────────────────────────────────
    @IsString()
    @IsOptional()
    holderName?: string;

    @IsString()
    @IsOptional()
    beneficiaryName?: string;

    @IsString()
    @IsOptional()
    bankName?: string;

    @IsString()
    @IsOptional()
    accountType?: string;

    /**
     * Número de cuenta enmascarado para display seguro (ej: ****5678).
     * Usar en producción. Prohibido exponer número completo en canales reales.
     */
    @IsString()
    @IsOptional()
    accountNumberMasked?: string;

    /**
     * Número de cuenta completo. Permitido SOLO en canales con isTest:true.
     * En canales de producción usar únicamente accountNumberMasked.
     */
    @IsString()
    @IsOptional()
    accountNumber?: string;

    @IsString()
    @IsOptional()
    routingNumber?: string;

    @IsString()
    @IsOptional()
    alias?: string;

    @IsString()
    @IsOptional()
    accountAlias?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    documentId?: string;

    @IsString()
    @IsOptional()
    bankCode?: string;

    // ── Geolocalización ────────────────────────────────────────────────────────
    @IsString()
    @IsOptional()
    currency?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    instructions?: string;

    // ── Campos exclusivos: mode MANUAL_CONFIRMATION ────────────────────────────
    @IsBoolean()
    @IsOptional()
    requiresProofUpload?: boolean;

    @IsBoolean()
    @IsOptional()
    requiresReferenceNumber?: boolean;

    @IsBoolean()
    @IsOptional()
    requiresSenderName?: boolean;

    @IsBoolean()
    @IsOptional()
    requiresSenderDocument?: boolean;

    @IsNumber()
    @Min(0)
    @IsOptional()
    expectedConfirmationMinutes?: number;

    // ── Campos exclusivos: mode API_AUTOMATED ──────────────────────────────────
    @IsString()
    @IsOptional()
    apiProviderCode?: string;

    @IsBoolean()
    @IsOptional()
    webhookEnabled?: boolean;

    // ── Límites operacionales del canal ────────────────────────────────────────
    @IsNumber()
    @Min(0)
    @IsOptional()
    minAmount?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    maxAmount?: number;

    // ── Flags ──────────────────────────────────────────────────────────────────
    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean;

    @IsBoolean()
    @IsOptional()
    isTest?: boolean;

    @IsEnum(['development', 'staging', 'production'])
    @IsOptional()
    environment?: 'development' | 'staging' | 'production';
}

export class CreateFiatMetadataDto {
    @IsString()
    isoCurrencyCode: string;

    @IsArray()
    @IsString({ each: true })
    countries: string[];

    @IsString()
    symbol: string;
}

export class CreateCryptoMetadataDto {
    @IsString()
    coinId: string;

    @IsString()
    @IsOptional()
    contractAddress?: string;

    @IsArray()
    @IsString({ each: true })
    networks: string[];
}

export class CreateAssetDto {
    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsEnum(['fiat', 'crypto', 'internal'])
    type: 'fiat' | 'crypto' | 'internal';

    @IsEnum(['CRYPTO', 'FIAT', 'STABLECOIN', 'LAUNCHPAD', 'INTERNAL'])
    @IsOptional()
    category?: 'CRYPTO' | 'FIAT' | 'STABLECOIN' | 'LAUNCHPAD' | 'INTERNAL';

    @IsNumber()
    @Min(0)
    @Max(18)
    decimals: number;

    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

    @IsNumber()
    @IsOptional()
    minAmount?: number;

    @IsNumber()
    @IsOptional()
    maxAmount?: number;

    @ValidateNested()
    @Type(() => CreateFiatMetadataDto)
    @IsOptional()
    fiatMetadata?: CreateFiatMetadataDto;

    @ValidateNested()
    @Type(() => CreateCryptoMetadataDto)
    @IsOptional()
    cryptoMetadata?: CreateCryptoMetadataDto;

    @IsBoolean()
    @IsOptional()
    requiresKYC?: boolean;

    @IsEnum(['BASIC', 'VERIFIED', 'ADVANCED'])
    @IsOptional()
    level?: 'BASIC' | 'VERIFIED' | 'ADVANCED';

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    iconUrl?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsBoolean()
    @IsOptional()
    canBuy?: boolean;

    @IsBoolean()
    @IsOptional()
    canSell?: boolean;

    @IsBoolean()
    @IsOptional()
    canConvert?: boolean;

    @IsBoolean()
    @IsOptional()
    canSend?: boolean;

    @IsBoolean()
    @IsOptional()
    canWithdraw?: boolean;

    @IsBoolean()
    @IsOptional()
    canP2P?: boolean;

    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;

    @IsBoolean()
    @IsOptional()
    isRepresentativeBalance?: boolean;

    @IsBoolean()
    @IsOptional()
    requiresComplianceReview?: boolean;

    @IsString()
    @IsOptional()
    createdBy?: string;
}

export class UpdateAssetDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(['CRYPTO', 'FIAT', 'STABLECOIN', 'LAUNCHPAD', 'INTERNAL'])
    @IsOptional()
    category?: 'CRYPTO' | 'FIAT' | 'STABLECOIN' | 'LAUNCHPAD' | 'INTERNAL';

    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

    @IsNumber()
    @IsOptional()
    minAmount?: number;

    @IsNumber()
    @IsOptional()
    maxAmount?: number;

    @IsBoolean()
    @IsOptional()
    requiresKYC?: boolean;

    @IsEnum(['BASIC', 'VERIFIED', 'ADVANCED'])
    @IsOptional()
    level?: 'BASIC' | 'VERIFIED' | 'ADVANCED';

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    iconUrl?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsBoolean()
    @IsOptional()
    canBuy?: boolean;

    @IsBoolean()
    @IsOptional()
    canSell?: boolean;

    @IsBoolean()
    @IsOptional()
    canConvert?: boolean;

    @IsBoolean()
    @IsOptional()
    canSend?: boolean;

    @IsBoolean()
    @IsOptional()
    canWithdraw?: boolean;

    @IsBoolean()
    @IsOptional()
    canP2P?: boolean;

    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;

    @IsBoolean()
    @IsOptional()
    isRepresentativeBalance?: boolean;

    @IsBoolean()
    @IsOptional()
    requiresComplianceReview?: boolean;

    // Catalog control
    @IsBoolean()
    @IsOptional()
    isVisibleInFrontend?: boolean;

    @IsNumber()
    @IsOptional()
    displayOrder?: number;

    @IsString()
    @IsOptional()
    badge?: string;

    @IsEnum(['mvp', 'phase_2', 'blocked'])
    @IsOptional()
    rolloutPhase?: 'mvp' | 'phase_2' | 'blocked';

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    paymentMethods?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FundingChannelDto)
    @IsOptional()
    fundingChannels?: FundingChannelDto[];
}
