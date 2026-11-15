/**
 * DECO EXCHANGE – Asset Registry Seed Script
 * =============================================
 * Pobla la base de datos con todos los activos (crypto + fiat + launchpad)
 * y redes (blockchains + rieles fiat) soportados por la plataforma.
 *
 * Uso:  npx ts-node scripts/seed.ts
 *   o:  curl directo → node scripts/seed-via-api.ts
 */

const BASE = process.env.REGISTRY_URL || 'http://localhost:3010/api/v1';
const TOKEN = process.env.INTERNAL_AUTH_TOKEN || '';

// ─── HEADERS ────────────────────────────────────────────
const headers = {
  'Content-Type': 'application/json',
  'x-internal-auth': TOKEN,
};

// ─── NETWORKS ───────────────────────────────────────────
const networks = [
  // ── Blockchains ──
  {
    code: 'BTC',
    name: 'Bitcoin Mainnet',
    kind: 'BLOCKCHAIN',
    chainId: 0,
    confirmations: 3,
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0.0001,
    minWithdrawalFee: 0,
  },
  {
    code: 'ERC20',
    name: 'Ethereum (ERC-20)',
    kind: 'BLOCKCHAIN',
    chainId: 1,
    confirmations: 12,
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0.0015,
    minWithdrawalFee: 0,
  },
  {
    code: 'TRC20',
    name: 'Tron (TRC-20)',
    kind: 'BLOCKCHAIN',
    chainId: 728126,
    confirmations: 20,
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 1.0,
    minWithdrawalFee: 0,
  },
  {
    code: 'BEP20',
    name: 'BNB Smart Chain (BEP-20)',
    kind: 'BLOCKCHAIN',
    chainId: 56,
    confirmations: 15,
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0.0005,
    minWithdrawalFee: 0,
  },
  {
    code: 'SOL',
    name: 'Solana',
    kind: 'BLOCKCHAIN',
    chainId: 0,
    confirmations: 32,
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0.01,
    minWithdrawalFee: 0,
  },
  {
    code: 'TON',
    name: 'The Open Network',
    kind: 'BLOCKCHAIN',
    chainId: 0,
    confirmations: 1,
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0.05,
    minWithdrawalFee: 0,
  },
  {
    code: 'POLYGON',
    name: 'Polygon PoS',
    kind: 'BLOCKCHAIN',
    chainId: 137,
    confirmations: 128,
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0.1,
    minWithdrawalFee: 0,
  },
  // ── Rieles Fiat ──
  {
    code: 'SPEI',
    name: 'SPEI (México)',
    kind: 'RAIL_FIAT',
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0,
    minWithdrawalFee: 0,
  },
  {
    code: 'PSE',
    name: 'PSE (Colombia)',
    kind: 'RAIL_FIAT',
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0,
    minWithdrawalFee: 0,
  },
  {
    code: 'ACH',
    name: 'ACH Transfer (USA)',
    kind: 'RAIL_FIAT',
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0,
    minWithdrawalFee: 0,
  },
  {
    code: 'WIRE',
    name: 'Wire Transfer (Internacional)',
    kind: 'RAIL_FIAT',
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 25,
    minWithdrawalFee: 25,
  },
  {
    code: 'SEPA',
    name: 'SEPA (Europa)',
    kind: 'RAIL_FIAT',
    withdrawalFeeType: 'FIXED',
    withdrawalFeeValue: 0.5,
    minWithdrawalFee: 0,
  },
];

// ─── ASSETS: CRYPTO ─────────────────────────────────────
const cryptoAssets = [
  {
    code: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    category: 'CRYPTO',
    decimals: 8,
    minAmount: 0.00001,
    maxAmount: 100,
    requiresKYC: false,
    level: 'BASIC',
    cryptoMetadata: {
      coinId: 'bitcoin',
      networks: ['BTC', 'ERC20', 'BEP20'],
    },
  },
  {
    code: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    category: 'CRYPTO',
    decimals: 18,
    minAmount: 0.0001,
    maxAmount: 5000,
    requiresKYC: false,
    level: 'BASIC',
    cryptoMetadata: {
      coinId: 'ethereum',
      networks: ['ERC20', 'BEP20'],
    },
  },
  {
    code: 'BNB',
    name: 'BNB',
    type: 'crypto',
    category: 'CRYPTO',
    decimals: 18,
    minAmount: 0.001,
    maxAmount: 10000,
    requiresKYC: false,
    level: 'BASIC',
    cryptoMetadata: {
      coinId: 'binancecoin',
      networks: ['BEP20'],
    },
  },
  {
    code: 'USDT',
    name: 'Tether USD',
    type: 'crypto',
    category: 'STABLECOIN',
    decimals: 6,
    minAmount: 1,
    maxAmount: 1000000,
    requiresKYC: false,
    level: 'BASIC',
    cryptoMetadata: {
      coinId: 'tether',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      networks: ['ERC20', 'TRC20', 'BEP20', 'SOL', 'POLYGON', 'TON'],
    },
  },
  {
    code: 'USDC',
    name: 'USD Coin',
    type: 'crypto',
    category: 'STABLECOIN',
    decimals: 6,
    minAmount: 1,
    maxAmount: 1000000,
    requiresKYC: false,
    level: 'BASIC',
    cryptoMetadata: {
      coinId: 'usd-coin',
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      networks: ['ERC20', 'TRC20', 'BEP20', 'SOL', 'POLYGON'],
    },
  },
  {
    code: 'TON',
    name: 'Toncoin',
    type: 'crypto',
    category: 'CRYPTO',
    decimals: 9,
    minAmount: 0.1,
    maxAmount: 500000,
    requiresKYC: false,
    level: 'BASIC',
    cryptoMetadata: {
      coinId: 'the-open-network',
      networks: ['TON'],
    },
  },
  {
    code: 'WLD',
    name: 'Worldcoin',
    type: 'crypto',
    category: 'CRYPTO',
    decimals: 18,
    minAmount: 1,
    maxAmount: 1000000,
    requiresKYC: false,
    level: 'BASIC',
    cryptoMetadata: {
      coinId: 'worldcoin-wld',
      networks: ['ERC20'],
    },
  },
  // ── Launchpad Tokens ──
  {
    code: 'DECOX',
    name: 'Deco Token',
    type: 'crypto',
    category: 'LAUNCHPAD',
    decimals: 18,
    minAmount: 1,
    maxAmount: 10000000,
    requiresKYC: true,
    level: 'VERIFIED',
    cryptoMetadata: {
      coinId: 'DECOX-token',
      networks: ['BEP20'],
    },
  },
  {
    code: 'DECO',
    name: 'Deco Token',
    type: 'crypto',
    category: 'LAUNCHPAD',
    decimals: 18,
    minAmount: 1,
    maxAmount: 10000000,
    requiresKYC: true,
    level: 'VERIFIED',
    cryptoMetadata: {
      coinId: 'DECOX-coin',
      networks: ['BEP20'],
    },
  },
  {
    code: 'DECO',
    name: 'Deco Token',
    type: 'crypto',
    category: 'LAUNCHPAD',
    decimals: 18,
    minAmount: 1,
    maxAmount: 10000000,
    requiresKYC: true,
    level: 'VERIFIED',
    cryptoMetadata: {
      coinId: 'deco-token',
      networks: ['BEP20'],
    },
  },
  {
    code: 'GDUSD',
    name: 'Gold Dollar',
    type: 'crypto',
    category: 'LAUNCHPAD',
    decimals: 18,
    minAmount: 1,
    maxAmount: 10000000,
    requiresKYC: true,
    level: 'VERIFIED',
    cryptoMetadata: {
      coinId: 'gold-dollar',
      networks: ['BEP20'],
    },
  },
];

// ─── ASSETS: FIAT ───────────────────────────────────────
const fiatAssets = [
  {
    code: 'USD',
    name: 'US Dollar',
    type: 'fiat',
    category: 'STABLECOIN',
    decimals: 2,
    minAmount: 1,
    maxAmount: 1000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'USD', countries: ['US'], symbol: '$' },
  },
  {
    code: 'COP',
    name: 'Peso Colombiano',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 1000,
    maxAmount: 500000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'COP', countries: ['CO'], symbol: '$' },
  },
  {
    code: 'MXN',
    name: 'Peso Mexicano',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 10,
    maxAmount: 20000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'MXN', countries: ['MX'], symbol: '$' },
  },
  {
    code: 'PEN',
    name: 'Sol Peruano',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 5,
    maxAmount: 5000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'PEN', countries: ['PE'], symbol: 'S/' },
  },
  {
    code: 'EUR',
    name: 'Euro',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 1,
    maxAmount: 1000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'EUR', countries: ['DE', 'FR', 'ES', 'IT', 'NL'], symbol: '€' },
  },
  {
    code: 'VES',
    name: 'Bolívar Venezolano',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 100,
    maxAmount: 100000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'VES', countries: ['VE'], symbol: 'Bs' },
  },
  {
    code: 'SVC',
    name: 'Colón Salvadoreño',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 1,
    maxAmount: 10000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'SVC', countries: ['SV'], symbol: '₡' },
  },
  {
    code: 'BRL',
    name: 'Real Brasileño',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 5,
    maxAmount: 5000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'BRL', countries: ['BR'], symbol: 'R$' },
  },
  {
    code: 'ARS',
    name: 'Peso Argentino',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 100,
    maxAmount: 500000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'ARS', countries: ['AR'], symbol: '$' },
  },
  {
    code: 'CLP',
    name: 'Peso Chileno',
    type: 'fiat',
    category: 'FIAT',
    decimals: 0,
    minAmount: 500,
    maxAmount: 500000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'CLP', countries: ['CL'], symbol: '$' },
  },
  {
    code: 'GBP',
    name: 'Libra Esterlina',
    type: 'fiat',
    category: 'FIAT',
    decimals: 2,
    minAmount: 1,
    maxAmount: 1000000,
    requiresKYC: false,
    level: 'BASIC',
    fiatMetadata: { isoCurrencyCode: 'GBP', countries: ['GB'], symbol: '£' },
  },
];

// ─── RUNNER ─────────────────────────────────────────────
async function post(path: string, body: any): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function seed() {
  console.log('═══════════════════════════════════════════════');
  console.log('  DECO EXCHANGE – Asset Registry Seed');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Seed Networks
  console.log('── Networks ──────────────────────────────────');
  let netOk = 0,
    netSkip = 0;
  for (const net of networks) {
    const { status, data } = await post('/internal/networks', net);
    if (status === 201) {
      console.log(`  ✅ ${net.code.padEnd(10)} ${net.name}`);
      netOk++;
    } else if (status === 400 && data?.message?.includes('already exists')) {
      console.log(`  ⏭️  ${net.code.padEnd(10)} ya existe`);
      netSkip++;
    } else {
      console.log(`  ❌ ${net.code.padEnd(10)} Error ${status}: ${JSON.stringify(data)}`);
    }
  }
  console.log(`  → ${netOk} creadas, ${netSkip} ya existían\n`);

  // 2. Seed Crypto Assets
  console.log('── Crypto Assets ─────────────────────────────');
  let cryptoOk = 0,
    cryptoSkip = 0;
  for (const asset of cryptoAssets) {
    const { status, data } = await post('/internal/assets', asset);
    if (status === 201) {
      console.log(`  ✅ ${asset.code.padEnd(8)} ${asset.name}`);
      cryptoOk++;
    } else if (status === 400 && data?.message?.includes('already exists')) {
      console.log(`  ⏭️  ${asset.code.padEnd(8)} ya existe`);
      cryptoSkip++;
    } else {
      console.log(`  ❌ ${asset.code.padEnd(8)} Error ${status}: ${JSON.stringify(data)}`);
    }
  }
  console.log(`  → ${cryptoOk} creados, ${cryptoSkip} ya existían\n`);

  // 3. Seed Fiat Assets
  console.log('── Fiat Assets ───────────────────────────────');
  let fiatOk = 0,
    fiatSkip = 0;
  for (const asset of fiatAssets) {
    const { status, data } = await post('/internal/assets', asset);
    if (status === 201) {
      console.log(`  ✅ ${asset.code.padEnd(8)} ${asset.name}`);
      fiatOk++;
    } else if (status === 400 && data?.message?.includes('already exists')) {
      console.log(`  ⏭️  ${asset.code.padEnd(8)} ya existe`);
      fiatSkip++;
    } else {
      console.log(`  ❌ ${asset.code.padEnd(8)} Error ${status}: ${JSON.stringify(data)}`);
    }
  }
  console.log(`  → ${fiatOk} creados, ${fiatSkip} ya existían\n`);

  // Summary
  const totalAssets = cryptoOk + fiatOk;
  const totalSkip = cryptoSkip + fiatSkip + netSkip;
  console.log('═══════════════════════════════════════════════');
  console.log(`  TOTAL: ${netOk} networks + ${totalAssets} assets creados`);
  if (totalSkip > 0) console.log(`         ${totalSkip} registros ya existían (idempotente)`);
  console.log('═══════════════════════════════════════════════');
}

seed().catch(console.error);
