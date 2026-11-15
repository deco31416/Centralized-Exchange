export type AssetStatus = "available" | "limited" | "coming-soon" | "disabled"

export type AssetKind = "crypto" | "stablecoin" | "fiat" | "deco-token"

export type AssetChartType = "tradingview" | "deco-rate" | "deco-token"

export type AssetChartPoint = {
  label: string
  value: number
}

export type AssetRateQuote = {
  source: string
  last: number
  bid?: number
  ask?: number
  spreadPct?: number
  high24h?: number
  low24h?: number
  updatedAtLabel?: string
}

export type AssetProduct =
  | "buy"
  | "sell"
  | "convert"
  | "send"
  | "spot"
  | "p2p"
  | "staking"
  | "add-money"
  | "withdraw-credit"
  | "remittances"

export type CatalogAsset = {
  slug: string
  symbol: string
  name: string
  shortName: string
  type: AssetKind
  status: AssetStatus
  description: string
  detail: string
  iconLabel: string
  color: string
  chartType: AssetChartType
  tradingViewSymbol?: string
  referencePair: string
  referenceValue: string
  referenceChange: string
  chartSeries?: AssetChartPoint[]
  rateQuote?: AssetRateQuote
  countries: string[]
  networks: string[]
  products: AssetProduct[]
  legalLinks: Array<{ href: string; label: string }>
  risks: string[]
  metrics: Array<{ label: string; value: string; detail: string }>
  seoTitle: string
  seoDescription: string
}

export type PaymentMethodType = "wallet" | "bank" | "rail" | "cash" | "card"

export type CatalogPaymentMethod = {
  slug: string
  name: string
  type: PaymentMethodType
  status: AssetStatus
  officialSite: {
    href: string
    label: string
  }
  country: string
  countries: string[]
  currencies: string[]
  providerType: string
  description: string
  detail: string
  iconLabel: string
  color: string
  estimatedTime: string
  minAmount: string
  feeLabel: string
  requiresKyc: boolean
  requiresOwnership: boolean
  products: AssetProduct[]
  legalLinks: Array<{ href: string; label: string }>
  availabilityNotes: string
  seoTitle: string
  seoDescription: string
}

export const productLabels: Record<AssetProduct, string> = {
  "add-money": "Recargar",
  buy: "Comprar",
  convert: "Convertir",
  p2p: "P2P",
  remittances: "Remesas",
  sell: "Vender",
  send: "Enviar",
  spot: "Spot",
  staking: "Rendimiento",
  "withdraw-credit": "Retirar",
}

export const statusLabels: Record<AssetStatus, string> = {
  available: "Disponible",
  "coming-soon": "Pronto",
  disabled: "No disponible",
  limited: "Limitado",
}

export const assetTypeLabels: Record<AssetKind, string> = {
  crypto: "Cripto",
  "deco-token": "Token Deco",
  fiat: "Fiat",
  stablecoin: "Stablecoin",
}

export const paymentMethodTypeLabels: Record<PaymentMethodType, string> = {
  bank: "Banco",
  card: "Tarjeta",
  cash: "Efectivo",
  rail: "Rail",
  wallet: "Wallet",
}

export const catalogAssets: CatalogAsset[] = [
  {
    slug: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    shortName: "Bitcoin",
    type: "crypto",
    status: "available",
    description: "Activo digital usado como referencia principal del mercado cripto.",
    detail: "Consulta precio publico, disponibilidad y rutas para comprar, vender o seguir BTC dentro de Deco.",
    iconLabel: "BTC",
    color: "#f7931a",
    chartType: "tradingview",
    tradingViewSymbol: "BINANCE:BTCUSDT",
    referencePair: "BTC/USDT",
    referenceValue: "67,420.50",
    referenceChange: "+2.18%",
    countries: ["Global", "Colombia", "Estados Unidos", "México"],
    networks: ["Bitcoin"],
    products: ["buy", "sell", "convert", "send", "spot", "p2p"],
    legalLinks: [
      { href: "/legals/criptoactivos", label: "Criptoactivos" },
      { href: "/legals/risks", label: "Riesgos" },
    ],
    risks: ["Volatilidad alta", "Confirmaciones de red", "Disponibilidad por region"],
    metrics: [
      { label: "Mercado", value: "Publico", detail: "TradingView" },
      { label: "Red", value: "Bitcoin", detail: "L1" },
      { label: "Uso Deco", value: "6 flujos", detail: "Compra, P2P y spot" },
    ],
    seoTitle: "Bitcoin BTC en Deco Exchange",
    seoDescription: "Consulta precio, disponibilidad y usos de Bitcoin dentro de Deco Exchange.",
  },
  {
    slug: "eth",
    symbol: "ETH",
    name: "Ethereum",
    shortName: "Ethereum",
    type: "crypto",
    status: "available",
    description: "Activo y red para contratos inteligentes, Web3 y liquidez cripto.",
    detail: "ETH se muestra como referencia pública para operar, convertir y evaluar disponibilidad.",
    iconLabel: "ETH",
    color: "#627eea",
    chartType: "tradingview",
    tradingViewSymbol: "BINANCE:ETHUSDT",
    referencePair: "ETH/USDT",
    referenceValue: "3,520.20",
    referenceChange: "+1.34%",
    countries: ["Global", "Colombia", "Estados Unidos", "México"],
    networks: ["Ethereum", "ERC-20"],
    products: ["buy", "sell", "convert", "send", "spot", "staking"],
    legalLinks: [
      { href: "/legals/criptoactivos", label: "Criptoactivos" },
      { href: "/legals/risks", label: "Riesgos" },
    ],
    risks: ["Volatilidad", "Fees de red", "Riesgo de contratos"],
    metrics: [
      { label: "Mercado", value: "Publico", detail: "TradingView" },
      { label: "Red", value: "Ethereum", detail: "EVM" },
      { label: "Uso Deco", value: "6 flujos", detail: "Compra, envio y rendimiento" },
    ],
    seoTitle: "Ethereum ETH en Deco Exchange",
    seoDescription: "Consulta precio, disponibilidad y usos de Ethereum dentro de Deco Exchange.",
  },
  {
    slug: "sol",
    symbol: "SOL",
    name: "Solana",
    shortName: "Solana",
    type: "crypto",
    status: "available",
    description: "Activo digital de alta actividad para mercados cripto y ecosistemas Web3.",
    detail: "SOL se usa como referencia de mercado publico y activo elegible para flujos cripto.",
    iconLabel: "SOL",
    color: "#14f195",
    chartType: "tradingview",
    tradingViewSymbol: "BINANCE:SOLUSDT",
    referencePair: "SOL/USDT",
    referenceValue: "150.00",
    referenceChange: "+0.86%",
    countries: ["Global", "Colombia", "México"],
    networks: ["Solana"],
    products: ["buy", "sell", "convert", "send", "spot"],
    legalLinks: [
      { href: "/legals/criptoactivos", label: "Criptoactivos" },
      { href: "/legals/risks", label: "Riesgos" },
    ],
    risks: ["Volatilidad", "Disponibilidad por proveedor", "Estado de red"],
    metrics: [
      { label: "Mercado", value: "Publico", detail: "TradingView" },
      { label: "Red", value: "Solana", detail: "L1" },
      { label: "Uso Deco", value: "5 flujos", detail: "Compra y spot" },
    ],
    seoTitle: "Solana SOL en Deco Exchange",
    seoDescription: "Consulta precio, disponibilidad y usos de Solana dentro de Deco Exchange.",
  },
  {
    slug: "usdt",
    symbol: "USDT",
    name: "Tether USD",
    shortName: "USDT",
    type: "stablecoin",
    status: "available",
    description: "Stablecoin usada como referencia dolarizada en mercados cripto.",
    detail: "USDT conecta liquidez cripto, P2P, spot y flujos mayoristas bajo disponibilidad.",
    iconLabel: "USDT",
    color: "#26a17b",
    chartType: "tradingview",
    tradingViewSymbol: "COINBASE:USDTUSD",
    referencePair: "USDT/USD",
    referenceValue: "1.00",
    referenceChange: "+0.01%",
    countries: ["Global", "Colombia", "Estados Unidos", "México"],
    networks: ["Ethereum", "Tron", "Solana"],
    products: ["buy", "sell", "convert", "send", "spot", "p2p"],
    legalLinks: [
      { href: "/legals/criptoactivos", label: "Criptoactivos" },
      { href: "/legals/risks", label: "Riesgos" },
    ],
    risks: ["Riesgo de emisor", "Red seleccionada", "Disponibilidad por region"],
    metrics: [
      { label: "Referencia", value: "USD", detail: "Stablecoin" },
      { label: "Redes", value: "3+", detail: "Según proveedor" },
      { label: "Uso Deco", value: "6 flujos", detail: "P2P, spot y OTC" },
    ],
    seoTitle: "USDT en Deco Exchange",
    seoDescription: "Consulta disponibilidad y usos de USDT dentro de Deco Exchange.",
  },
  {
    slug: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    shortName: "USDC",
    type: "stablecoin",
    status: "available",
    description: "Stablecoin dolarizada usada para conversion, pagos y liquidez digital.",
    detail: "USDC se presenta con referencia pública y disponibilidad por red/proveedor.",
    iconLabel: "USDC",
    color: "#2775ca",
    chartType: "tradingview",
    tradingViewSymbol: "COINBASE:USDCUSD",
    referencePair: "USDC/USD",
    referenceValue: "1.00",
    referenceChange: "+0.00%",
    countries: ["Global", "Estados Unidos", "Colombia", "México"],
    networks: ["Ethereum", "Solana", "Base"],
    products: ["buy", "sell", "convert", "send", "spot", "p2p"],
    legalLinks: [
      { href: "/legals/criptoactivos", label: "Criptoactivos" },
      { href: "/legals/risks", label: "Riesgos" },
    ],
    risks: ["Riesgo de emisor", "Red seleccionada", "Disponibilidad por region"],
    metrics: [
      { label: "Referencia", value: "USD", detail: "Stablecoin" },
      { label: "Redes", value: "3+", detail: "Según proveedor" },
      { label: "Uso Deco", value: "6 flujos", detail: "Compra, envio y P2P" },
    ],
    seoTitle: "USDC en Deco Exchange",
    seoDescription: "Consulta disponibilidad y usos de USDC dentro de Deco Exchange.",
  },
  {
    slug: "usd",
    symbol: "USD",
    name: "Dólar estadounidense",
    shortName: "Dólar",
    type: "fiat",
    status: "available",
    description: "Moneda fiat base para referencias globales y operaciones internacionales.",
    detail: "USD sirve como unidad de referencia para tasas, stablecoins, remesas y conversiones.",
    iconLabel: "USD",
    color: "#16a34a",
    chartType: "deco-rate",
    referencePair: "USD/COP",
    referenceValue: "4,000.00",
    referenceChange: "+0.45%",
    countries: ["Estados Unidos", "Panama", "Global"],
    networks: ["ACH", "Wire", "SWIFT"],
    products: ["add-money", "withdraw-credit", "remittances", "buy", "sell", "convert"],
    legalLinks: [
      { href: "/legals/monedas", label: "Monedas" },
      { href: "/legals/tasas", label: "Tasas" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    risks: ["Tasa referencial", "Disponibilidad por estado", "Comisiones por proveedor"],
    metrics: [
      { label: "Tipo", value: "Fiat", detail: "Referencia global" },
      { label: "Uso Deco", value: "6 flujos", detail: "Bolsillito y crypto facil" },
      { label: "Tasa", value: "Referencial", detail: "No firmable" },
    ],
    seoTitle: "Dólar USD en Deco Exchange",
    seoDescription: "Consulta tasa referencial, disponibilidad y usos del dólar estadounidense dentro de Deco Exchange.",
  },
  {
    slug: "cop",
    symbol: "COP",
    name: "Peso colombiano",
    shortName: "Peso colombiano",
    type: "fiat",
    status: "available",
    description: "Moneda fiat local para recargas, retiros y operaciones en Colombia.",
    detail: "COP conecta PSE, wallets locales, corresponsales y flujos de Bolsillito.",
    iconLabel: "COP",
    color: "#facc15",
    chartType: "deco-rate",
    referencePair: "USD/COP",
    referenceValue: "4,000.00",
    referenceChange: "+0.45%",
    countries: ["Colombia"],
    networks: ["PSE", "Nequi", "Daviplata", "Corresponsales"],
    products: ["add-money", "withdraw-credit", "remittances", "buy", "sell", "p2p"],
    legalLinks: [
      { href: "/legals/monedas", label: "Monedas" },
      { href: "/legals/electronicos", label: "Electrónicos" },
      { href: "/legals/efectivo", label: "Efectivo" },
    ],
    risks: ["Disponibilidad local", "Mínimo operacional", "Validación de titularidad"],
    metrics: [
      { label: "Mínimo recarga", value: "10,000 COP", detail: "Referencial" },
      { label: "País", value: "Colombia", detail: "Local" },
      { label: "Métodos", value: "4+", detail: "PSE, wallets y efectivo" },
    ],
    seoTitle: "Peso colombiano COP en Deco Exchange",
    seoDescription: "Consulta disponibilidad, métodos y usos del peso colombiano dentro de Deco Exchange.",
  },
  {
    slug: "mxn",
    symbol: "MXN",
    name: "Peso mexicano",
    shortName: "Peso mexicano",
    type: "fiat",
    status: "limited",
    description: "Moneda fiat para referencias, compra cripto y expansión de métodos en México.",
    detail: "MXN se muestra como moneda soportada de forma referencial mientras se habilitan rails locales.",
    iconLabel: "MXN",
    color: "#15803d",
    chartType: "deco-rate",
    referencePair: "USD/MXN",
    referenceValue: "18.20",
    referenceChange: "-0.12%",
    countries: ["México"],
    networks: ["SPEI", "Tarjetas", "Bancos locales"],
    products: ["add-money", "withdraw-credit", "buy", "sell", "convert"],
    legalLinks: [
      { href: "/legals/monedas", label: "Monedas" },
      { href: "/legals/tasas", label: "Tasas" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    risks: ["Disponibilidad por proveedor", "Tasa referencial", "Validación local"],
    metrics: [
      { label: "País", value: "México", detail: "Expansión" },
      { label: "Tasa", value: "Referencial", detail: "USD/MXN" },
      { label: "Estado", value: "Limitado", detail: "Según proveedor" },
    ],
    seoTitle: "Peso mexicano MXN en Deco Exchange",
    seoDescription: "Consulta disponibilidad, tasas y usos del peso mexicano dentro de Deco Exchange.",
  },
  {
    slug: "deco",
    symbol: "DECO",
    name: "DECOToken",
    shortName: "DECO",
    type: "deco-token",
    status: "coming-soon",
    description: "Token del ecosistema Deco para utilidad, comunidad y programas internos.",
    detail: "DECOToken tiene ficha de producto separada de su documento legal y usa gráfica Deco propia.",
    iconLabel: "DECO",
    color: "#ff6c02",
    chartType: "deco-token",
    referencePair: "DECO/USDT",
    referenceValue: "0.031416",
    referenceChange: "+0.00%",
    countries: ["Global"],
    networks: ["Ecosistema Deco"],
    products: ["convert", "p2p"],
    legalLinks: [
      { href: "/legals/deco-token", label: "DECOToken legal" },
      { href: "/legals/risks", label: "Riesgos" },
    ],
    risks: ["Token interno", "Disponibilidad progresiva", "No promesa de rendimiento"],
    metrics: [
      { label: "Tipo", value: "Ecosistema", detail: "Token Deco" },
      { label: "Grafica", value: "Deco", detail: "Propia" },
      { label: "Estado", value: "Pronto", detail: "Sujeto a reglas" },
    ],
    seoTitle: "DECOToken en Deco Exchange",
    seoDescription: "Consulta utilidad, disponibilidad y reglas de DECOToken dentro de Deco Exchange.",
  },
]

export const paymentMethods: CatalogPaymentMethod[] = [
  {
    slug: "pse",
    name: "PSE",
    type: "bank",
    status: "available",
    officialSite: {
      href: "https://www.pse.com.co/",
      label: "PSE",
    },
    country: "Colombia",
    countries: ["CO"],
    currencies: ["COP"],
    providerType: "Banco colombiano",
    description: "Conecta bancos colombianos para recargar saldo COP en Bolsillito.",
    detail: "PSE se usa como rail bancario local para recargas y pagos con validación de titularidad.",
    iconLabel: "PSE",
    color: "#ff6c02",
    estimatedTime: "5-20 min",
    minAmount: "10,000 COP",
    feeLabel: "Sin costo Deco",
    requiresKyc: true,
    requiresOwnership: true,
    products: ["add-money", "buy", "p2p"],
    legalLinks: [
      { href: "/legals/electronicos", label: "Medios electronicos" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    availabilityNotes: "Disponible en Colombia para COP segun banco y proveedor.",
    seoTitle: "PSE en Deco Exchange",
    seoDescription: "Consulta disponibilidad, tiempos y usos de PSE dentro de Deco Exchange.",
  },
  {
    slug: "nequi",
    name: "Nequi",
    type: "wallet",
    status: "available",
    officialSite: {
      href: "https://www.nequi.com.co/",
      label: "Nequi",
    },
    country: "Colombia",
    countries: ["CO"],
    currencies: ["COP"],
    providerType: "Wallet local",
    description: "Wallet local para recargas y pagos en pesos colombianos.",
    detail: "Nequi permite experiencias rapidas para saldo COP cuando el proveedor este disponible.",
    iconLabel: "NQ",
    color: "#be185d",
    estimatedTime: "5-15 min",
    minAmount: "10,000 COP",
    feeLabel: "Según proveedor",
    requiresKyc: true,
    requiresOwnership: true,
    products: ["add-money", "withdraw-credit", "p2p"],
    legalLinks: [
      { href: "/legals/electronicos", label: "Medios electronicos" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    availabilityNotes: "Disponible para Colombia en COP sujeto a integracion/proveedor.",
    seoTitle: "Nequi en Deco Exchange",
    seoDescription: "Consulta disponibilidad, tiempos y usos de Nequi dentro de Deco Exchange.",
  },
  {
    slug: "daviplata",
    name: "Daviplata",
    type: "wallet",
    status: "available",
    officialSite: {
      href: "https://www.daviplata.com/",
      label: "Daviplata",
    },
    country: "Colombia",
    countries: ["CO"],
    currencies: ["COP"],
    providerType: "Wallet local",
    description: "Wallet local para operaciones COP en Colombia.",
    detail: "Daviplata puede habilitar recargas, retiros y pagos P2P segun disponibilidad.",
    iconLabel: "DP",
    color: "#dc2626",
    estimatedTime: "5-15 min",
    minAmount: "10,000 COP",
    feeLabel: "Según proveedor",
    requiresKyc: true,
    requiresOwnership: true,
    products: ["add-money", "withdraw-credit", "p2p"],
    legalLinks: [
      { href: "/legals/electronicos", label: "Medios electronicos" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    availabilityNotes: "Disponible para Colombia en COP sujeto a proveedor.",
    seoTitle: "Daviplata en Deco Exchange",
    seoDescription: "Consulta disponibilidad, tiempos y usos de Daviplata dentro de Deco Exchange.",
  },
  {
    slug: "nubank",
    name: "NuBank",
    type: "bank",
    status: "limited",
    officialSite: {
      href: "https://nubank.com.br/",
      label: "NuBank",
    },
    country: "Brasil y LatAm",
    countries: ["BR", "MX", "CO"],
    currencies: ["BRL", "MXN", "COP"],
    providerType: "Banco digital",
    description: "Banco digital para rails locales donde exista cobertura.",
    detail: "NuBank se modela como proveedor regional con disponibilidad por pais y moneda.",
    iconLabel: "NU",
    color: "#820ad1",
    estimatedTime: "5-30 min",
    minAmount: "Según país",
    feeLabel: "Según proveedor",
    requiresKyc: true,
    requiresOwnership: true,
    products: ["add-money", "withdraw-credit", "buy"],
    legalLinks: [
      { href: "/legals/electronicos", label: "Medios electronicos" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    availabilityNotes: "Disponibilidad sujeta a pais, moneda y proveedor.",
    seoTitle: "NuBank en Deco Exchange",
    seoDescription: "Consulta disponibilidad, paises y usos de NuBank dentro de Deco Exchange.",
  },
  {
    slug: "pix",
    name: "Pix",
    type: "rail",
    status: "coming-soon",
    officialSite: {
      href: "https://www.bcb.gov.br/estabilidadefinanceira/pix",
      label: "Banco Central do Brasil",
    },
    country: "Brasil",
    countries: ["BR"],
    currencies: ["BRL"],
    providerType: "Rail instantaneo",
    description: "Rail brasileno para pagos y transferencias BRL.",
    detail: "Pix se prepara como método local para Brasil con disponibilidad por proveedor.",
    iconLabel: "PIX",
    color: "#00b894",
    estimatedTime: "Instantaneo",
    minAmount: "10 BRL",
    feeLabel: "Variable",
    requiresKyc: true,
    requiresOwnership: true,
    products: ["add-money", "withdraw-credit", "p2p"],
    legalLinks: [
      { href: "/legals/electronicos", label: "Medios electronicos" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    availabilityNotes: "Planeado para Brasil en BRL.",
    seoTitle: "Pix en Deco Exchange",
    seoDescription: "Consulta disponibilidad y usos de Pix dentro de Deco Exchange.",
  },
  {
    slug: "red-deco",
    name: "Red Deco",
    type: "cash",
    status: "coming-soon",
    officialSite: {
      href: "/bolsillito/red-deco",
      label: "Red Deco",
    },
    country: "LatAm",
    countries: ["CO", "MX", "PE", "VE", "DO", "PA"],
    currencies: ["COP", "MXN", "PEN", "VES", "DOP", "USD"],
    providerType: "Red de aliados",
    description: "Aliados verificados para depositos, retiros y remesas presenciales.",
    detail: "Red Deco conecta efectivo, saldo Deco, P2P, bancos, wallets y rutas de remesa segun pais, horario, KYC/KYB y limites.",
    iconLabel: "RED",
    color: "#ff6c02",
    estimatedTime: "15-90 min",
    minAmount: "Según pais",
    feeLabel: "Ruta variable",
    requiresKyc: true,
    requiresOwnership: false,
    products: ["add-money", "withdraw-credit", "remittances", "p2p"],
    legalLinks: [
      { href: "/legals/red-deco", label: "Red Deco" },
      { href: "/legals/efectivo", label: "Efectivo" },
      { href: "/legals/kyc-aml", label: "KYC / AML" },
    ],
    availabilityNotes: "MVP mock. La disponibilidad real depende de pais, aliado, horario, limites y verificacion.",
    seoTitle: "Red Deco en Deco Exchange",
    seoDescription: "Consulta disponibilidad, usos y reglas de Red Deco para efectivo, retiros y remesas presenciales.",
  },
  {
    slug: "cash",
    name: "Efectivo",
    type: "cash",
    status: "limited",
    officialSite: {
      href: "https://www.superfinanciera.gov.co/",
      label: "Superfinanciera",
    },
    country: "LatAm",
    countries: ["CO", "MX", "DO", "PA"],
    currencies: ["COP", "MXN", "DOP", "USD"],
    providerType: "Corresponsales",
    description: "Depositos y retiros en efectivo mediante puntos aliados.",
    detail: "Efectivo agrupa corresponsales, cajeros y puntos disponibles por pais.",
    iconLabel: "CASH",
    color: "#f59e0b",
    estimatedTime: "15-60 min",
    minAmount: "Según país",
    feeLabel: "Variable",
    requiresKyc: true,
    requiresOwnership: false,
    products: ["add-money", "withdraw-credit", "remittances", "p2p"],
    legalLinks: [
      { href: "/legals/efectivo", label: "Efectivo" },
      { href: "/legals/cajeros", label: "Cajeros" },
      { href: "/legals/giros-puntos", label: "Giros y puntos" },
    ],
    availabilityNotes: "Disponible por pais, punto aliado y horario operativo.",
    seoTitle: "Efectivo en Deco Exchange",
    seoDescription: "Consulta disponibilidad, tiempos y usos de efectivo dentro de Deco Exchange.",
  },
  {
    slug: "cards",
    name: "Tarjetas",
    type: "card",
    status: "limited",
    officialSite: {
      href: "https://www.pcisecuritystandards.org/",
      label: "PCI Security Standards",
    },
    country: "Global",
    countries: ["Global"],
    currencies: ["USD", "COP", "MXN", "EUR"],
    providerType: "Red de tarjetas",
    description: "Tarjetas debito o credito segun pais, emisor y proveedor.",
    detail: "Tarjetas se muestran como método de pago referencial sujeto a validación y reglas.",
    iconLabel: "CARD",
    color: "#2563eb",
    estimatedTime: "Instantaneo",
    minAmount: "Según moneda",
    feeLabel: "Variable",
    requiresKyc: true,
    requiresOwnership: true,
    products: ["add-money", "buy"],
    legalLinks: [
      { href: "/legals/tarjetas", label: "Tarjetas" },
      { href: "/legals/comisiones", label: "Comisiones" },
    ],
    availabilityNotes: "Disponibilidad según país, emisor, proveedor y validación antifraude.",
    seoTitle: "Tarjetas en Deco Exchange",
    seoDescription: "Consulta disponibilidad, tiempos y usos de tarjetas dentro de Deco Exchange.",
  },
]

export function getAssetBySlug(slug: string) {
  return catalogAssets.find((asset) => asset.slug === slug.toLowerCase())
}

export function getPaymentMethodBySlug(slug: string) {
  return paymentMethods.find((method) => method.slug === slug.toLowerCase())
}

export function getAssetsByType(type: AssetKind) {
  return catalogAssets.filter((asset) => asset.type === type)
}

export function getCryptoAssets() {
  return catalogAssets.filter((asset) => asset.type === "crypto" || asset.type === "stablecoin")
}

export function getFiatAssets() {
  return catalogAssets.filter((asset) => asset.type === "fiat")
}

export function getTokenAssets() {
  return catalogAssets.filter((asset) => asset.type === "deco-token")
}

export function getRelatedMethodsForAsset(asset: CatalogAsset) {
  return paymentMethods.filter((method) => method.currencies.some((currency) => currency === asset.symbol))
}
