/**
 * Seed del catálogo de activos crypto habilitados para P2P en BlackCEX.
 *
 * REGLAS ABSOLUTAS:
 * - NO incluir DECOX, DECO, DECO — son tokens internos, NO disponibles en P2P público
 * - requiresEscrow: true para TODOS en MVP (el crypto se bloquea antes de crear orden)
 * - iconUrls: paths relativos a blackCEX--Landing/public (sin CDN todavía)
 * - supportedFiatCodes: monedas fiat en que puede cotizarse el activo en P2P
 * - Upsert key: assetCode (único) — idempotente al re-ejecutar
 */

export interface P2PAssetSeedEntry {
  assetCode: string;
  displayName: string;
  description: string;
  iconUrl: string;
  enabled: boolean;
  supportedFiatCodes: string[];
  minCryptoAmount: number;
  maxCryptoAmount: number;
  requiresEscrow: boolean;
  sortOrder: number;
  comingSoon: boolean;
}

export const P2P_ASSET_CATALOG_SEED: P2PAssetSeedEntry[] = [
  {
    assetCode: 'USDT',
    displayName: 'Tether USD',
    description: 'Stablecoin anclada al USD. La más usada en mercados P2P latinoamericanos.',
    iconUrl: '/images/logos/stablecoin/tether-usdt-logo_nwgfgy.svg',
    enabled: true,
    supportedFiatCodes: ['COP', 'MXN', 'PEN', 'ARS', 'BRL', 'USD', 'EUR', 'GBP', 'VES'],
    minCryptoAmount: 1,
    maxCryptoAmount: 0,
    requiresEscrow: true,
    sortOrder: 1,
    comingSoon: false,
  },
  {
    assetCode: 'USDC',
    displayName: 'USD Coin',
    description: 'Stablecoin regulada anclada al USD. Emitida por Circle.',
    iconUrl: '/images/logos/stablecoin/usdcoin-usdc-logo_rkqw1c.svg',
    enabled: true,
    supportedFiatCodes: ['COP', 'MXN', 'PEN', 'ARS', 'BRL', 'USD', 'EUR', 'GBP', 'VES'],
    minCryptoAmount: 1,
    maxCryptoAmount: 0,
    requiresEscrow: true,
    sortOrder: 2,
    comingSoon: false,
  },
  {
    assetCode: 'BTC',
    displayName: 'Bitcoin',
    description: 'La criptomoneda más establecida. Alta liquidez en todos los mercados.',
    iconUrl: '/images/logos/coins/bitcoin-btc-logo_vftsg2.svg',
    enabled: true,
    supportedFiatCodes: ['COP', 'MXN', 'PEN', 'ARS', 'BRL', 'USD', 'EUR', 'GBP', 'VES'],
    minCryptoAmount: 0.0001,
    maxCryptoAmount: 0,
    requiresEscrow: true,
    sortOrder: 3,
    comingSoon: false,
  },
  {
    assetCode: 'ETH',
    displayName: 'Ethereum',
    description: 'Segunda criptomoneda por capitalización. Alta liquidez y amplia adopción.',
    iconUrl: '/images/logos/coins/ethereum-eth-logo_vgwnfh.svg',
    enabled: true,
    supportedFiatCodes: ['COP', 'MXN', 'PEN', 'ARS', 'BRL', 'USD', 'EUR', 'GBP', 'VES'],
    minCryptoAmount: 0.001,
    maxCryptoAmount: 0,
    requiresEscrow: true,
    sortOrder: 4,
    comingSoon: false,
  },
  {
    assetCode: 'BNB',
    displayName: 'BNB (BNB Chain)',
    description: 'Token nativo de BNB Chain. Ampliamente usado en DEX y DeFi.',
    iconUrl: '/images/logos/coins/bnbchain-bnb-logo.svg',
    enabled: true,
    supportedFiatCodes: ['COP', 'MXN', 'PEN', 'ARS', 'BRL', 'USD'],
    minCryptoAmount: 0.01,
    maxCryptoAmount: 0,
    requiresEscrow: true,
    sortOrder: 5,
    comingSoon: false,
  },
  {
    assetCode: 'TON',
    displayName: 'Toncoin',
    description: 'Blockchain de The Open Network. Creciente adopción en Telegram.',
    iconUrl: '/images/logos/coins/toncoin-ton-logo_kp3fzb.svg',
    enabled: true,
    supportedFiatCodes: ['COP', 'MXN', 'PEN', 'USD'],
    minCryptoAmount: 0.1,
    maxCryptoAmount: 0,
    requiresEscrow: true,
    sortOrder: 6,
    comingSoon: false,
  },
];
