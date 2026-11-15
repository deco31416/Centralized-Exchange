/**
 * Datos base de los 22 assets del ecosistema DECO EXCHANGE.
 * Fuente de verdad: /prices/all del pricing-aggregator (:3013)
 *
 * iconUrl: path relativo servido desde blackCEX--Landing/public
 * GBP: usa logo temporal EU/Euro hasta que se suba logo GBP propio (PRICING-LOGO-GBP-001)
 * Cloudinary upload: futuro — PRICING-LOGO-CLOUDINARY-UPLOAD-001 (baja prioridad)
 */

/**
 * Canal de recarga/fondeo para un activo fiat.
 *
 * Soporta dos modos de operación:
 *   API_AUTOMATED     — integración automática por API / webhook del proveedor
 *   MANUAL_CONFIRMATION — el usuario transfiere y un admin confirma manualmente
 *
 * Todos los registros con isTest:true son DEMO y no deben usarse en producción.
 * Nunca almacenar datos bancarios completos reales aquí; usar accountNumberMasked.
 */
export interface FundingChannelSeed {
    // ── Discriminador ────────────────────────────────────────────────────────
    /**
     * Modo de operación del canal.
     * Omitido en canales legacy → se asume MANUAL_CONFIRMATION por seguridad.
     */
    mode?: 'API_AUTOMATED' | 'MANUAL_CONFIRMATION';

    // ── Identificación ────────────────────────────────────────────────────────
    /** Tipo de canal: 'bank_transfer' | 'mobile_payment' | 'cash_reference' | 'internal_credit' */
    type: string;
    /** Nombre interno del proveedor (banco, billetera, red de tiendas) */
    provider: string;
    /** Nombre amigable para mostrar en UI al usuario final */
    displayName?: string;

    // ── Beneficiario (DEMO — nunca datos reales en environment: development) ──
    /** Titular de la cuenta: siempre 'BlackCEX Demo' en isTest:true */
    holderName: string;
    /** Alias semántico de holderName para nuevas integraciones */
    beneficiaryName?: string;
    /** Nombre del banco */
    bankName?: string;
    /** Tipo de cuenta: 'Cuenta Corriente', 'CLABE', 'IBAN', 'CBU', 'Chave PIX', etc. */
    accountType?: string;
    /**
     * Número de cuenta ENMASCARADO para display seguro (ej: ****5678).
     * Usar este campo en producción. Nunca exponer número completo.
     */
    accountNumberMasked?: string;
    /** Número de cuenta completo — SOLO para seeds con isTest:true */
    accountNumber?: string;
    /** Routing / CLABE / IBAN / CBU / SWIFT — DEMO */
    routingNumber?: string;
    /** Alias de billetera (Mercado Pago, PIX email/key, etc.) */
    alias?: string;
    /** Alias semántico para nuevas integraciones */
    accountAlias?: string;
    /** Teléfono receptor (Pago Móvil VE, Nequi, Yape) — DEMO */
    phone?: string;
    /** Documento de identidad del receptor — DEMO */
    documentId?: string;
    /** Código de banco interbancario (Pago Móvil Venezuela) */
    bankCode?: string;

    // ── Geolocalización ───────────────────────────────────────────────────────
    /** Moneda ISO del canal */
    currency: string;
    /** País ISO del canal (código ISO 3166-1 alpha-2) */
    country: string;

    // ── UX / Instrucciones ────────────────────────────────────────────────────
    /** Instrucciones en texto libre mostradas al usuario */
    instructions?: string;

    // ── Campos exclusivos: mode MANUAL_CONFIRMATION ───────────────────────────
    /** El usuario debe adjuntar comprobante de pago */
    requiresProofUpload?: boolean;
    /** El usuario debe indicar el número de referencia de la transferencia */
    requiresReferenceNumber?: boolean;
    /** El usuario debe indicar el nombre del remitente */
    requiresSenderName?: boolean;
    /** El usuario debe indicar el documento del remitente */
    requiresSenderDocument?: boolean;
    /** Tiempo estimado de confirmación administrativa en minutos */
    expectedConfirmationMinutes?: number;

    // ── Campos exclusivos: mode API_AUTOMATED ─────────────────────────────────
    /** Código del proveedor en el sistema de pagos (ej: 'clip', 'openpay', 'pix_itau') */
    apiProviderCode?: string;
    /** El proveedor envía webhooks automáticos de confirmación */
    webhookEnabled?: boolean;

    // ── Límites operacionales del canal ───────────────────────────────────────
    /** Monto mínimo aceptado por este canal (en unidades mayores de la moneda, ej: 100 = $100) */
    minAmount?: number;
    /** Monto máximo aceptado por este canal */
    maxAmount?: number;

    // ── Flags ─────────────────────────────────────────────────────────────────
    /** Canal operativo: acepta nuevas solicitudes */
    isEnabled?: boolean;
    /** Datos de prueba — no funcional en producción */
    isTest: boolean;
    /** Entorno al que aplica: 'development' | 'staging' | 'production' */
    environment: 'development' | 'staging' | 'production';
}

export interface AssetSeedData {
    code: string;
    name: string;
    type: 'fiat' | 'crypto' | 'internal';
    decimals: number;
    category: 'CRYPTO' | 'FIAT' | 'STABLECOIN' | 'LAUNCHPAD' | 'INTERNAL';
    description: string;
    iconUrl: string | null;
    logoUrl: string | null;
    enabled: boolean;
    canBuy: boolean;
    canSell: boolean;
    canConvert: boolean;
    canSend: boolean;
    canWithdraw?: boolean;
    canP2P?: boolean;
    isInternal?: boolean;
    isRepresentativeBalance?: boolean;
    requiresComplianceReview?: boolean;
    fiatMetadata?: { isoCurrencyCode: string; countries: string[]; symbol: string };
    cryptoMetadata?: { coinId: string; networks: string[] };
    // Catalog control fields
    isVisibleInFrontend?: boolean;
    displayOrder?: number;
    badge?: string;
    rolloutPhase?: 'mvp' | 'phase_2' | 'blocked';
    paymentMethods?: string[];
    /**
     * Canales de recarga con datos demo de desarrollo.
     * Solo se incluyen en activos fiat. Todos con isTest:true.
     */
    fundingChannels?: FundingChannelSeed[];
}

export const ASSET_SEEDS: AssetSeedData[] = [
    // ─── FIAT ────────────────────────────────────────────────────────────
    {
        code: 'BLC',
        name: 'BlackCEX Credit',
        type: 'internal',
        decimals: 2,
        category: 'INTERNAL',
        description: 'Unidad interna representativa de saldo dentro de BlackCEX.',
        iconUrl: '/images/logos/stablecoin/blc-blackcex-credit-logo.svg',
        logoUrl: '/images/logos/stablecoin/blc-blackcex-credit-logo.svg',
        enabled: true,
        canBuy: false,
        canSell: false,
        canConvert: true,
        canSend: true,
        canWithdraw: false,
        canP2P: false,
        isInternal: true,
        isRepresentativeBalance: true,
        requiresComplianceReview: true,
        isVisibleInFrontend: true,
        displayOrder: 0,
        rolloutPhase: 'mvp',
        paymentMethods: [],
    },

    {
        code: 'USD',
        name: 'US Dollar',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Dólar estadounidense, moneda de reserva mundial.',
        iconUrl: '/images/logos/FiatAccepted/usa-us-usd-logo_lx28hi.svg',
        logoUrl: '/images/logos/FiatAccepted/usa-us-usd-logo_lx28hi.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'USD', countries: ['US', 'PA', 'SV'], symbol: '$' },
        isVisibleInFrontend: true,
        displayOrder: 20,
        rolloutPhase: 'mvp',
        paymentMethods: ['wire', 'ach', 'card'],
        fundingChannels: [
            {
                type: 'bank_transfer',
                provider: 'Wire Transfer (SWIFT)',
                bankName: 'Demo Bank USA',
                accountType: 'Checking',
                accountNumber: '123456789',
                routingNumber: 'DEMOSWFT001',
                holderName: 'BlackCEX Demo',
                currency: 'USD',
                country: 'US',
                instructions: 'Transferencia SWIFT demo. Incluir referencia de usuario en el campo memo. Datos DEMO — no funcional en producción.',
                isTest: true,
                environment: 'development',
            },
            {
                type: 'bank_transfer',
                provider: 'ACH Transfer',
                bankName: 'Demo Bank USA',
                accountType: 'Checking',
                accountNumber: '987654321',
                routingNumber: '021000021',
                holderName: 'BlackCEX Demo',
                currency: 'USD',
                country: 'US',
                instructions: 'ACH transfer demo. Procesamiento en 1-3 días hábiles. Datos DEMO.',
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'COP',
        name: 'Peso Colombiano',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de Colombia.',
        iconUrl: '/images/logos/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg',
        logoUrl: '/images/logos/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'COP', countries: ['CO'], symbol: '$' },
        isVisibleInFrontend: true,
        displayOrder: 30,
        rolloutPhase: 'mvp',
        paymentMethods: ['pse', 'nequi', 'daviplata', 'card', 'deposit'],
        fundingChannels: [
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'bank_transfer',
                provider: 'Bancolombia',
                displayName: 'Transferencia Bancolombia',
                bankName: 'Bancolombia',
                accountType: 'Cuenta Corriente',
                accountNumber: '69812345678',
                accountNumberMasked: '****5678',
                routingNumber: '0032-069812345678',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'COP',
                country: 'CO',
                instructions: 'Transferir exactamente el monto indicado. Incluir referencia de pago en el concepto. Canal manual — el admin confirma en máx. 1h hábil.',
                requiresProofUpload: true,
                requiresReferenceNumber: true,
                requiresSenderName: true,
                requiresSenderDocument: false,
                expectedConfirmationMinutes: 60,
                minAmount: 10000,
                maxAmount: 5000000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'mobile_payment',
                provider: 'Nequi',
                displayName: 'Nequi',
                phone: 'xxxxx--xxxxx',
                accountNumberMasked: '****4567',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'COP',
                country: 'CO',
                instructions: 'Enviar a este número de Nequi. Adjuntar comprobante. El admin acredita en máx. 1h hábil.',
                requiresProofUpload: true,
                requiresReferenceNumber: false,
                requiresSenderName: true,
                requiresSenderDocument: false,
                expectedConfirmationMinutes: 60,
                minAmount: 5000,
                maxAmount: 2000000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'mobile_payment',
                provider: 'Daviplata',
                displayName: 'Daviplata',
                phone: 'xxxxx--xxxxx',
                accountNumberMasked: '****6543',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'COP',
                country: 'CO',
                instructions: 'Enviar a este número de Daviplata. Adjuntar comprobante.',
                requiresProofUpload: true,
                requiresReferenceNumber: false,
                requiresSenderName: true,
                requiresSenderDocument: false,
                expectedConfirmationMinutes: 60,
                minAmount: 5000,
                maxAmount: 2000000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'MXN',
        name: 'Peso Mexicano',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de México.',
        iconUrl: '/images/logos/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg',
        logoUrl: '/images/logos/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'MXN', countries: ['MX'], symbol: '$' },
        isVisibleInFrontend: true,
        displayOrder: 10,
        rolloutPhase: 'mvp',
        paymentMethods: ['spei', 'card', 'store', 'deposit'],
        fundingChannels: [
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'bank_transfer',
                provider: 'BBVA México',
                displayName: 'SPEI — BBVA México',
                bankName: 'BBVA México',
                accountType: 'CLABE',
                routingNumber: '012180001234567890',
                accountNumberMasked: '****7890',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'MXN',
                country: 'MX',
                instructions: 'Transferencia SPEI a esta CLABE. Incluir tu referencia de usuario en el concepto. Canal de confirmación manual — el admin verifica y acredita.',
                requiresProofUpload: true,
                requiresReferenceNumber: true,
                requiresSenderName: false,
                requiresSenderDocument: false,
                expectedConfirmationMinutes: 60,
                minAmount: 100,
                maxAmount: 100000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'cash_reference',
                provider: 'OXXO Pay',
                displayName: 'OXXO Pay — Efectivo',
                accountNumber: 'OXXO-BLC-000001',
                accountNumberMasked: '****0001',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'MXN',
                country: 'MX',
                instructions: 'Presentar esta referencia en cualquier OXXO para pagar en efectivo. Demo — no funcional en producción.',
                requiresProofUpload: true,
                requiresReferenceNumber: true,
                requiresSenderName: false,
                requiresSenderDocument: false,
                expectedConfirmationMinutes: 120,
                minAmount: 50,
                maxAmount: 10000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'PEN',
        name: 'Sol Peruano',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de Perú.',
        iconUrl: '/images/logos/FiatAccepted/peru-pe-sol-logo_rbaixq.svg',
        logoUrl: '/images/logos/FiatAccepted/peru-pe-sol-logo_rbaixq.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'PEN', countries: ['PE'], symbol: 'S/' },
        isVisibleInFrontend: false,
        displayOrder: 80,
        rolloutPhase: 'phase_2',
        badge: 'pronto',
        paymentMethods: ['card', 'deposit', 'yape', 'plin'],
        fundingChannels: [
            {
                type: 'bank_transfer',
                provider: 'BCP',
                bankName: 'Banco de Crédito del Perú',
                accountType: 'Cuenta Corriente',
                accountNumber: '191-12345678-0-12',
                routingNumber: '00219112345678012',
                holderName: 'BlackCEX Demo',
                currency: 'PEN',
                country: 'PE',
                instructions: 'Transferencia interbancaria a esta cuenta BCP. CCI incluido.',
                isTest: true,
                environment: 'development',
            },
            {
                type: 'mobile_payment',
                provider: 'Yape',
                phone: 'xxxxx--xxxxx',
                holderName: 'BlackCEX Demo',
                currency: 'PEN',
                country: 'PE',
                instructions: 'Yape a este número. Adjuntar captura de pantalla del comprobante.',
                isTest: true,
                environment: 'development',
            },
            {
                type: 'mobile_payment',
                provider: 'Plin',
                phone: 'xxxxx--xxxxx',
                holderName: 'BlackCEX Demo',
                currency: 'PEN',
                country: 'PE',
                instructions: 'Plin a este número. Adjuntar captura de pantalla del comprobante.',
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'VES',
        name: 'Bolívar Venezolano',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de Venezuela.',
        iconUrl: '/images/logos/FiatAccepted/venezuela-ve-ves-logo_s3y7me.svg',
        logoUrl: '/images/logos/FiatAccepted/venezuela-ve-ves-logo_s3y7me.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'VES', countries: ['VE'], symbol: 'Bs.S' },
        isVisibleInFrontend: true,
        displayOrder: 90,
        rolloutPhase: 'phase_2',
        paymentMethods: ['bank_transfer', 'mobile_payment'],
        fundingChannels: [
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'bank_transfer',
                provider: 'Banco de Venezuela',
                displayName: 'Transferencia BDV',
                bankName: 'Banco de Venezuela',
                accountType: 'Cuenta Corriente',
                accountNumber: '01020012345678901234',
                accountNumberMasked: '****1234',
                routingNumber: '0102',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'VES',
                country: 'VE',
                instructions: 'Transferencia a cuenta corriente BDV. Incluir cédula y referencia en el concepto.',
                requiresProofUpload: true,
                requiresReferenceNumber: true,
                requiresSenderName: true,
                requiresSenderDocument: true,
                expectedConfirmationMinutes: 120,
                minAmount: 5,
                maxAmount: 50000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'mobile_payment',
                provider: 'Pago Móvil',
                displayName: 'Pago Móvil Venezuela',
                bankName: 'Banco de Venezuela',
                bankCode: '0102',
                phone: 'xxxxx--xxxxx',
                documentId: 'V-12345678',
                accountNumberMasked: '****4567',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'VES',
                country: 'VE',
                instructions: 'Pago Móvil interbancario. Datos del receptor: Banco 0102 (BDV), Teléfono 04121234567, Cédula V-12345678. Todos los datos son DEMO.',
                requiresProofUpload: true,
                requiresReferenceNumber: true,
                requiresSenderName: true,
                requiresSenderDocument: true,
                expectedConfirmationMinutes: 120,
                minAmount: 5,
                maxAmount: 10000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'SVC',
        name: 'Colón Salvadoreño',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de El Salvador.',
        iconUrl: '/images/logos/FiatAccepted/elsalvador-sv-svc-logo.svg',
        logoUrl: '/images/logos/FiatAccepted/elsalvador-sv-svc-logo.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'SVC', countries: ['SV'], symbol: '₡' },
        isVisibleInFrontend: false,
        displayOrder: 110,
        rolloutPhase: 'phase_2',
        paymentMethods: ['card', 'deposit'],
    },
    {
        code: 'EUR',
        name: 'Euro',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de la Unión Europea.',
        iconUrl: '/images/logos/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg',
        logoUrl: '/images/logos/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'EUR', countries: ['EU'], symbol: '€' },
        isVisibleInFrontend: true,
        displayOrder: 40,
        rolloutPhase: 'mvp',
        paymentMethods: ['sepa', 'card', 'wire'],
        fundingChannels: [
            {
                type: 'bank_transfer',
                provider: 'SEPA Transfer',
                bankName: 'Demo Bank EU',
                accountType: 'IBAN',
                routingNumber: 'DE89370400440532013000',
                holderName: 'BlackCEX Demo',
                currency: 'EUR',
                country: 'EU',
                instructions: 'Transferencia SEPA a este IBAN. BIC: COBADEFFXXX (demo). Incluir referencia de usuario en el concepto.',
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'GBP',
        name: 'Libra Esterlina',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial del Reino Unido.',
        iconUrl: '/images/logos/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg', // Temporal — PRICING-LOGO-GBP-001
        logoUrl: '/images/logos/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'GBP', countries: ['GB'], symbol: '£' },
        isVisibleInFrontend: false,
        displayOrder: 100,
        rolloutPhase: 'phase_2',
        badge: 'pronto',
        paymentMethods: ['card', 'wire'],
    },
    {
        code: 'BRL',
        name: 'Real Brasileño',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de Brasil.',
        iconUrl: '/images/logos/FiatAccepted/brasil-br-brl-logo_dcxcvj.svg',
        logoUrl: '/images/logos/FiatAccepted/brasil-br-brl-logo_dcxcvj.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'BRL', countries: ['BR'], symbol: 'R$' },
        isVisibleInFrontend: false,
        displayOrder: 50,
        rolloutPhase: 'phase_2',
        badge: 'pronto',
        paymentMethods: ['pix', 'card', 'deposit'],
        fundingChannels: [
            {
                mode: 'MANUAL_CONFIRMATION',
                type: 'mobile_payment',
                provider: 'PIX',
                displayName: 'PIX Brasil',
                accountType: 'Chave PIX (e-mail)',
                accountAlias: 'xxxxx--xxxxx@example.invalid',
                accountNumberMasked: 'xxxxx--xxxxx@example.invalid',
                beneficiaryName: 'BlackCEX Demo',
                holderName: 'BlackCEX Demo',
                currency: 'BRL',
                country: 'BR',
                instructions: 'Enviar via PIX à chave xxxxx--xxxxx@example.invalid. Inclua a referência de pagamento no campo de descrição. DEMO — não operacional em produção.',
                requiresProofUpload: true,
                requiresReferenceNumber: true,
                requiresSenderName: true,
                requiresSenderDocument: false,
                expectedConfirmationMinutes: 30,
                minAmount: 5,
                maxAmount: 5000,
                isEnabled: true,
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'ARS',
        name: 'Peso Argentino',
        type: 'fiat',
        decimals: 2,
        category: 'FIAT',
        description: 'Moneda oficial de Argentina.',
        iconUrl: '/images/logos/FiatAccepted/argentina-ar-ars-logo_vhf9iy.svg',
        logoUrl: '/images/logos/FiatAccepted/argentina-ar-ars-logo_vhf9iy.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'ARS', countries: ['AR'], symbol: '$' },
        isVisibleInFrontend: true,
        displayOrder: 60,
        rolloutPhase: 'phase_2',
        paymentMethods: ['bank_transfer', 'mobile_payment'],
        fundingChannels: [
            {
                type: 'bank_transfer',
                provider: 'Banco Nación',
                bankName: 'Banco de la Nación Argentina',
                accountType: 'CBU',
                routingNumber: '0110012230001234567890',
                holderName: 'BlackCEX Demo',
                currency: 'ARS',
                country: 'AR',
                instructions: 'Transferir a este CBU. También disponible vía CVU. Datos DEMO.',
                isTest: true,
                environment: 'development',
            },
            {
                type: 'mobile_payment',
                provider: 'Mercado Pago',
                alias: 'blackcex.demo.mp',
                holderName: 'BlackCEX Demo',
                currency: 'ARS',
                country: 'AR',
                instructions: 'Transferir con alias de Mercado Pago: blackcex.demo.mp. Datos DEMO.',
                isTest: true,
                environment: 'development',
            },
        ],
    },
    {
        code: 'CLP',
        name: 'Peso Chileno',
        type: 'fiat',
        decimals: 0,
        category: 'FIAT',
        description: 'Moneda oficial de Chile.',
        iconUrl: '/images/logos/FiatAccepted/chile-cl-clp-logo.svg',
        logoUrl: '/images/logos/FiatAccepted/chile-cl-clp-logo.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: false, isInternal: false,
        fiatMetadata: { isoCurrencyCode: 'CLP', countries: ['CL'], symbol: '$' },
        isVisibleInFrontend: true,
        displayOrder: 70,
        rolloutPhase: 'phase_2',
        paymentMethods: ['bank_transfer'],
        fundingChannels: [
            {
                type: 'bank_transfer',
                provider: 'BancoEstado',
                bankName: 'BancoEstado',
                accountType: 'Cuenta Corriente',
                accountNumber: '00012345678',
                routingNumber: '504',
                holderName: 'BlackCEX Demo',
                currency: 'CLP',
                country: 'CL',
                instructions: 'Transferencia a cuenta corriente BancoEstado. Código banco: 504. Datos DEMO.',
                isTest: true,
                environment: 'development',
            },
        ],
    },

    // ─── CRYPTO ──────────────────────────────────────────────────────────
    {
        code: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        decimals: 8,
        category: 'CRYPTO',
        description: 'Primera criptomoneda descentralizada del mundo.',
        iconUrl: '/images/logos/coins/bitcoin-btc-logo_vftsg2.svg',
        logoUrl: '/images/logos/coins/bitcoin-btc-logo_vftsg2.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: true, isInternal: false,
        cryptoMetadata: { coinId: 'bitcoin', networks: ['BTC'] },
        isVisibleInFrontend: true,
        displayOrder: 10,
        rolloutPhase: 'mvp',
    },
    {
        code: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        decimals: 18,
        category: 'CRYPTO',
        description: 'Plataforma de contratos inteligentes y aplicaciones descentralizadas.',
        iconUrl: '/images/logos/coins/ethereum-eth-logo_vgwnfh.svg',
        logoUrl: '/images/logos/coins/ethereum-eth-logo_vgwnfh.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: true, isInternal: false,
        cryptoMetadata: { coinId: 'ethereum', networks: ['ERC20', 'ETH'] },
        isVisibleInFrontend: true,
        displayOrder: 20,
        rolloutPhase: 'mvp',
    },
    {
        code: 'BNB',
        name: 'BNB',
        type: 'crypto',
        decimals: 18,
        category: 'CRYPTO',
        description: 'Token nativo de BNB Chain (ex Binance Smart Chain).',
        iconUrl: '/images/logos/coins/binancecoin-bnb-logo_ohkihi.svg',
        logoUrl: '/images/logos/coins/binancecoin-bnb-logo_ohkihi.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: true, isInternal: false,
        cryptoMetadata: { coinId: 'binancecoin', networks: ['BSC', 'BEP20'] },
        isVisibleInFrontend: true,
        displayOrder: 50,
        rolloutPhase: 'mvp',
    },
    {
        code: 'TON',
        name: 'Toncoin',
        type: 'crypto',
        decimals: 9,
        category: 'CRYPTO',
        description: 'Criptomoneda nativa de The Open Network, blockchain de Telegram.',
        iconUrl: '/images/logos/coins/toncoin-ton-logo_kp3fzb.svg',
        logoUrl: '/images/logos/coins/toncoin-ton-logo_kp3fzb.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: true, isInternal: false,
        cryptoMetadata: { coinId: 'the-open-network', networks: ['TON'] },
        isVisibleInFrontend: false,
        displayOrder: 60,
        rolloutPhase: 'phase_2',
        badge: 'pronto',
    },
    {
        code: 'WLD',
        name: 'Worldcoin',
        type: 'crypto',
        decimals: 18,
        category: 'CRYPTO',
        description: 'Proyecto de identidad digital y criptomoneda global.',
        iconUrl: '/images/logos/altcoins/worldcoin-wld-dark-logo_nefjwe.svg',
        logoUrl: '/images/logos/altcoins/worldcoin-wld-dark-logo_nefjwe.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: true, isInternal: false,
        cryptoMetadata: { coinId: 'worldcoin-wld', networks: ['ERC20', 'OP'] },
        isVisibleInFrontend: false,
        displayOrder: 70,
        rolloutPhase: 'phase_2',
    },

    // ─── STABLECOIN ──────────────────────────────────────────────────────
    {
        code: 'USDT',
        name: 'Tether USD',
        type: 'crypto',
        decimals: 6,
        category: 'STABLECOIN',
        description: 'Stablecoin respaldada 1:1 con el dólar estadounidense.',
        iconUrl: '/images/logos/stablecoin/tether-usdt-logo_nwgfgy.svg',
        logoUrl: '/images/logos/stablecoin/tether-usdt-logo_nwgfgy.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: true, isInternal: false,
        cryptoMetadata: { coinId: 'tether', networks: ['ERC20', 'TRC20', 'BSC', 'TON'] },
        isVisibleInFrontend: true,
        displayOrder: 30,
        rolloutPhase: 'mvp',
    },
    {
        code: 'USDC',
        name: 'USD Coin',
        type: 'crypto',
        decimals: 6,
        category: 'STABLECOIN',
        description: 'Stablecoin regulada emitida por Circle, respaldada 1:1 con USD.',
        iconUrl: '/images/logos/stablecoin/usdcoin-usdc-logo_rkqw1c.svg',
        logoUrl: '/images/logos/stablecoin/usdcoin-usdc-logo_rkqw1c.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: true, canP2P: true, isInternal: false,
        cryptoMetadata: { coinId: 'usd-coin', networks: ['ERC20', 'BSC', 'SOL'] },
        isVisibleInFrontend: true,
        displayOrder: 40,
        rolloutPhase: 'mvp',
    },

    // ─── LAUNCHPAD ───────────────────────────────────────────────────────
    {
        code: 'DECO',
        name: 'DECO Token',
        type: 'crypto',
        decimals: 8,
        category: 'LAUNCHPAD',
        description: 'Token nativo del ecosistema DECO31416.',
        iconUrl: '/images/logos/altcoins/deco31416-decot-logo.svg',
        logoUrl: '/images/logos/altcoins/deco31416-decot-logo.svg',
        enabled: true,
        canBuy: true, canSell: true, canConvert: true, canSend: true,
        canWithdraw: false, canP2P: false, isInternal: true,
        cryptoMetadata: { coinId: 'deco-token', networks: ['INTERNAL'] },
        isVisibleInFrontend: false,
        displayOrder: 20,
        rolloutPhase: 'phase_2',
    },
    {
        code: 'DECOX',
        name: 'Deco Token',
        type: 'crypto',
        decimals: 8,
        category: 'LAUNCHPAD',
        description: 'Token principal del ecosistema DECO EXCHANGE.',
        iconUrl: '/images/logos/stablecoin/DECOTOKEN-DECOX-logo.svg',
        logoUrl: '/images/logos/stablecoin/DECOTOKEN-DECOX-logo.svg',
        enabled: true,
        canBuy: false, canSell: true, canConvert: true, canSend: true,
        canWithdraw: false, canP2P: false, isInternal: true,
        cryptoMetadata: { coinId: 'DECOX-token', networks: ['INTERNAL'] },
        isVisibleInFrontend: true,
        displayOrder: 10,
        rolloutPhase: 'mvp',
    },
    {
        code: 'DECO',
        name: 'Deco Token',
        type: 'crypto',
        decimals: 8,
        category: 'LAUNCHPAD',
        description: 'Moneda de utilidad interna del ecosistema DECOX.',
        iconUrl: '/images/logos/coins/DECOX-tcoin-logo.svg',
        logoUrl: '/images/logos/coins/DECOX-tcoin-logo.svg',
        enabled: true,
        canBuy: false, canSell: true, canConvert: true, canSend: true,
        canWithdraw: false, canP2P: false, isInternal: true,
        cryptoMetadata: { coinId: 'DECOX-coin', networks: ['INTERNAL'] },
        isVisibleInFrontend: false,
        displayOrder: 30,
        rolloutPhase: 'phase_2',
    },
    {
        code: 'GDUSD',
        name: 'Gold Dollar USD',
        type: 'crypto',
        decimals: 6,
        category: 'LAUNCHPAD',
        description: 'Stablecoin respaldada por oro del ecosistema DECOX.',
        iconUrl: '/images/logos/stablecoin/girosdollar-gdusd-logo.svg',
        logoUrl: '/images/logos/stablecoin/girosdollar-gdusd-logo.svg',
        enabled: true,
        canBuy: false, canSell: true, canConvert: true, canSend: true,
        canWithdraw: false, canP2P: false, isInternal: true,
        cryptoMetadata: { coinId: 'gold-dollar', networks: ['INTERNAL'] },
        isVisibleInFrontend: false,
        displayOrder: 40,
        rolloutPhase: 'phase_2',
    },
];
