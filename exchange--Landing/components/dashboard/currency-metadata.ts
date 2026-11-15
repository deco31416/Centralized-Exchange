export type FundMethodId =
  | "spei"     // México — CLABE
  | "card"     // Tarjeta Visa/MC/Amex (universal)
  | "store"    // Oxxo / 7-Eleven (México)
  | "deposit"  // Ventanilla bancaria
  | "ach"      // ACH (EE.UU.)
  | "wire"     // Wire / SWIFT (internacional)
  | "pse"      // PSE (Colombia)
  | "nequi"    // Nequi / Bancolombia (Colombia)
  | "sepa"     // SEPA (Europa)

export interface NetworkOption {
  id: string        // e.g. "erc20"
  name: string      // e.g. "Ethereum (ERC-20)"
  standard: string  // e.g. "ERC-20"
  warning?: string  // alerta crítica sobre red incorrecta
}

export interface CurrencyMetadata {
  code: string
  name: string
  type: "fiat" | "crypto"
  symbol: string
  decimals: number
  description: string
  issuer: string
  legalNote: string
  // Fiat
  isoCode?: string
  country?: string
  /** Métodos de fondeo disponibles para esta moneda fiat */
  fundMethods?: FundMethodId[]
  // Crypto
  network?: string
  standard?: string
  /** Redes disponibles para tokens multi-red (USDT, USDC, etc.) */
  networks?: NetworkOption[]
  contractAddress?: string
  website?: string
  launchYear?: number
  maxSupply?: string
  category?: "native" | "stablecoin" | "token" | "altcoin"
}

export const CURRENCY_METADATA: Record<string, CurrencyMetadata> = {
  // ── FIAT ────────────────────────────────────────────────────────────────
  MXN: {
    code: "MXN",
    name: "Peso Mexicano",
    type: "fiat",
    symbol: "$",
    decimals: 2,
    isoCode: "MXN",
    country: "México",
    description:
      "Moneda oficial de los Estados Unidos Mexicanos. Emitida y regulada por el Banco de México (Banxico). Es la decimocuarta moneda más negociada en el mundo según el BIS.",
    issuer: "Banco de México (Banxico)",
    legalNote:
      "Moneda de curso legal en México conforme a la Ley Monetaria de los Estados Unidos Mexicanos. Los saldos en MXN dentro de deco-exchange son cuentas de valor almacenado y no constituyen depósitos bancarios.",
    fundMethods: ["spei", "card", "store", "deposit"],
  },
  USD: {
    code: "USD",
    name: "Dólar Estadounidense",
    type: "fiat",
    symbol: "$",
    decimals: 2,
    isoCode: "USD",
    country: "Estados Unidos",
    description:
      "Moneda de reserva mundial y la más negociada en el mercado de divisas. Emitida por la Reserva Federal (Fed). Utilizada como referencia global para el precio de materias primas y criptomonedas.",
    issuer: "Reserva Federal de los Estados Unidos (Fed)",
    legalNote:
      "Los saldos en USD dentro de deco-exchange representan cuentas de valor almacenado denominadas en dólares. No son depósitos bancarios asegurados por el FDIC ni por el IPAB.",
    fundMethods: ["wire", "ach", "card"],
  },
  COP: {
    code: "COP",
    name: "Peso Colombiano",
    type: "fiat",
    symbol: "$",
    decimals: 2,
    isoCode: "COP",
    country: "Colombia",
    description:
      "Moneda oficial de la República de Colombia. Supervisada y emitida por el Banco de la República. Colombia es uno de los mercados de mayor adopción cripto en Latinoamérica.",
    issuer: "Banco de la República de Colombia",
    legalNote:
      "Los saldos en COP dentro de deco-exchange son cuentas de valor almacenado. No constituyen depósitos bancarios regulados por la Superintendencia Financiera de Colombia.",
    fundMethods: ["pse", "nequi", "card", "deposit"],
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    type: "fiat",
    symbol: "€",
    decimals: 2,
    isoCode: "EUR",
    country: "Zona Euro (27 países)",
    description:
      "Moneda oficial de la Unión Europea y segunda moneda de reserva más importante del mundo. Introducida en 1999 y en circulación física desde 2002. Es regulada por el Banco Central Europeo (BCE).",
    issuer: "Banco Central Europeo (BCE)",
    legalNote:
      "Los saldos en EUR dentro de deco-exchange son cuentas de valor almacenado. No están cubiertos por el Fondo de Garantía de Depósitos de la UE (FGDEC).",
    fundMethods: ["sepa", "card", "wire"],
  },
  VES: {
    code: "VES",
    name: "Bolívar Venezolano",
    type: "fiat",
    symbol: "Bs.S",
    decimals: 2,
    isoCode: "VES",
    country: "Venezuela",
    description:
      "Moneda oficial de la República Bolivariana de Venezuela. Emitida por el Banco Central de Venezuela (BCV). Los métodos de fondeo disponibles (transferencia BDV, Pago Móvil) se cargan dinámicamente desde el catálogo.",
    issuer: "Banco Central de Venezuela (BCV)",
    legalNote:
      "Los saldos en VES dentro de deco-exchange son cuentas de valor almacenado. No constituyen depósitos bancarios regulados por la Superintendencia de las Instituciones del Sector Bancario (SUDEBAN).",
    // Sin fundMethods estáticos — los canales llegan desde asset-registry (Pago Móvil, BDV)
  },
  BRL: {
    code: "BRL",
    name: "Real Brasileño",
    type: "fiat",
    symbol: "R$",
    decimals: 2,
    isoCode: "BRL",
    country: "Brasil",
    description:
      "Moneda oficial de la República Federativa del Brasil. Emitida por el Banco Central do Brasil. El sistema PIX permite transferencias instantáneas 24/7.",
    issuer: "Banco Central do Brasil",
    legalNote:
      "Los saldos en BRL dentro de deco-exchange son cuentas de valor almacenado. No están cubiertos por el Fundo Garantidor de Créditos (FGC).",
    // Sin fundMethods estáticos — el canal PIX llega desde asset-registry
  },
  // ── CRYPTO NATIVE ────────────────────────────────────────────────────────
  BTC: {
    code: "BTC",
    name: "Bitcoin",
    type: "crypto",
    symbol: "₿",
    decimals: 8,
    network: "Bitcoin",
    category: "native",
    launchYear: 2009,
    maxSupply: "21,000,000 BTC",
    website: "https://bitcoin.org",
    description:
      "Primera criptomoneda descentralizada del mundo. Protocolo peer-to-peer de transferencia de valor sin intermediarios, creado por Satoshi Nakamoto en 2009. Considerado \"oro digital\" por su oferta fija de 21 millones de unidades.",
    issuer: "Protocolo descentralizado (sin emisor central)",
    legalNote:
      "Bitcoin no es moneda de curso legal en México. Su tenencia y negociación está permitida bajo la Ley para Regular las Instituciones de Tecnología Financiera (Ley Fintech, 2018). Los saldos en BTC en deco-exchange son activos virtuales custodiados.",
  },
  ETH: {
    code: "ETH",
    name: "Ethereum",
    type: "crypto",
    symbol: "Ξ",
    decimals: 18,
    network: "Ethereum",
    category: "native",
    launchYear: 2015,
    maxSupply: "Sin límite fijo (con quema EIP-1559)",
    website: "https://ethereum.org",
    description:
      "Plataforma de contratos inteligentes y segunda criptomoneda por capitalización de mercado. Permite la ejecución de aplicaciones descentralizadas (dApps) y es la base de la mayoría de los tokens ERC-20 y NFTs.",
    issuer: "Ethereum Foundation / Protocolo descentralizado",
    legalNote:
      "Ether (ETH) es un activo virtual bajo la Ley Fintech de México. Su uso como medio de pago no tiene reconocimiento de curso legal. Los saldos en deco-exchange son activos custodiados.",
  },
  // ── STABLECOINS ──────────────────────────────────────────────────────────
  USDT: {
    code: "USDT",
    name: "Tether USD",
    type: "crypto",
    symbol: "₮",
    decimals: 6,
    network: "Ethereum / Tron / BNB Chain",
    standard: "ERC-20 / TRC-20 / BEP-20",
    networks: [
      { id: "erc20", name: "Ethereum (ERC-20)", standard: "ERC-20", warning: "Solo envía USDT en red Ethereum (ERC-20). Enviar desde otra red puede causar pérdida permanente de fondos." },
      { id: "trc20", name: "Tron (TRC-20)", standard: "TRC-20", warning: "Solo envía USDT en red Tron (TRC-20). Verifica la red en tu billetera antes de transferir." },
      { id: "bep20", name: "BNB Chain (BEP-20)", standard: "BEP-20", warning: "Solo envía USDT en red BNB Smart Chain (BEP-20). Usar otra red causará pérdida de fondos." },
    ],
    category: "stablecoin",
    launchYear: 2014,
    maxSupply: "Ilimitado (respaldado 1:1 con USD)",
    website: "https://tether.to",
    description:
      "Stablecoin más utilizada del mundo, anclada 1:1 al dólar estadounidense. Emitida por Tether Limited y disponible en múltiples redes. Es el activo más negociado por volumen diario en criptomonedas.",
    issuer: "Tether Limited (Hong Kong)",
    legalNote:
      "USDT es un activo virtual bajo la Ley Fintech. No está respaldado por el FDIC ni garantizado por ningún banco central. deco-exchange opera con USDT en la red indicada en cada transacción.",
  },
  USDC: {
    code: "USDC",
    name: "USD Coin",
    type: "crypto",
    symbol: "$",
    decimals: 6,
    network: "Ethereum / Solana / BNB Chain",
    standard: "ERC-20 / SPL / BEP-20",
    networks: [
      { id: "erc20", name: "Ethereum (ERC-20)", standard: "ERC-20", warning: "Solo envía USDC en red Ethereum (ERC-20). Transferir desde otra red puede causar pérdida permanente." },
      { id: "spl",   name: "Solana (SPL)",      standard: "SPL",    warning: "Solo envía USDC en red Solana (SPL). Usa siempre la dirección correcta para esta red." },
      { id: "bep20", name: "BNB Chain (BEP-20)", standard: "BEP-20", warning: "Solo envía USDC en red BNB Smart Chain (BEP-20). Verificar red antes de transferir." },
    ],
    category: "stablecoin",
    launchYear: 2018,
    maxSupply: "Ilimitado (respaldado 1:1 con USD)",
    website: "https://www.circle.com/usdc",
    description:
      "Stablecoin regulada emitida por Circle y respaldada por reservas en dólares auditadas mensualmente. Es la segunda stablecoin más grande y está disponible en más de 15 blockchains. Preferida en entornos DeFi institucionales.",
    issuer: "Circle Internet Financial (EE.UU.)",
    legalNote:
      "USDC está regulado bajo leyes de transmisión de dinero en EE.UU. No es moneda de curso legal en México. Las reservas son auditadas por Grant Thornton. Los saldos en deco-exchange son activos custodiados.",
  },
  // ── TOKENS PROPIOS ───────────────────────────────────────────────────────
  DECOX: {
    code: "DECOX",
    name: "Deco Token",
    type: "crypto",
    symbol: "⬡",
    decimals: 8,
    network: "DECO EXCHANGE Network",
    standard: "Token nativo",
    category: "token",
    launchYear: 2024,
    maxSupply: "100,000,000 DECOX",
    website: "https://DECOEXCHANGE.io",
    description:
      "Token de utilidad nativo del ecosistema DECO EXCHANGE. Utilizado para pago de comisiones con descuento, staking, acceso a funciones premium y participación en la gobernanza del protocolo.",
    issuer: "DECO EXCHANGE / deco31416.com 2026",
    legalNote:
      "DECOX es un activo virtual de utilidad emitido por DECO EXCHANGE. No representa participación accionaria ni deuda. Su tenencia otorga beneficios dentro del ecosistema DECOX conforme a los Términos de Servicio vigentes.",
  },
}

export function getCurrencyMetadata(code: string): CurrencyMetadata | undefined {
  return CURRENCY_METADATA[code.toUpperCase()]
}
