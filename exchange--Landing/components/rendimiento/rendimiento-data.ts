export type RendimientoView = "overview" | "staking" | "vault" | "reserves" | "activity" | "calculator"

export const rendimientoRoutes: Record<RendimientoView, string> = {
  overview: "/rendimiento",
  staking: "/rendimiento/staking-tokens",
  vault: "/rendimiento/boveda-programada",
  reserves: "/rendimiento/reservas",
  activity: "/rendimiento/activity",
  calculator: "/rendimiento/calculator",
}

export type RendimientoProduct = {
  id: string
  title: string
  mode: string
  asset: string
  estimate: string
  minimum: string
  liquidity: string
  risk: string
  fee: string
  description: string
}

export type RendimientoPosition = {
  id: string
  product: string
  amount: string
  status: string
  estimate: string
  nextStep: string
  asset: string
  mode: "Flexible" | "Programada"
  startedAt: string
  endsAt: string
  progress: number
  canWithdraw: boolean
  fee: string
}

export type VaultPlan = {
  term: string
  asset: string
  minimum: string
  estimate: string
  exit: string
  fee: string
}

export type ReserveAsset = {
  asset: string
  total: string
  users: string
  locked: string
  coverage: string
  kind: "Crypto" | "Fiat"
}

export type MerkleProofItem = {
  label: string
  value: string
}

export type UserReserveBreakdown = {
  label: string
  value: string
  detail: string
  share: string
}

export const rendimientoStats = [
  { label: "Saldo elegible", value: "1,240 USDT", detail: "Disponible para simular" },
  { label: "Retorno estimado", value: "Variable", detail: "Sujeto a condiciones" },
  { label: "Posiciones", value: "2", detail: "Mockup conectable" },
  { label: "Riesgo visible", value: "Activo", detail: "Antes de confirmar" },
]

export const rendimientoProducts: RendimientoProduct[] = [
  {
    id: "staking-usdt",
    title: "USDT Staking",
    mode: "Flexible",
    asset: "USDT",
    estimate: "Referencia variable",
    minimum: "20 USDT",
    liquidity: "Retiro disponible",
    risk: "Medio",
    fee: "Segun red",
    description: "Staking flexible para saldo elegible.",
  },
  {
    id: "staking-eth",
    title: "ETH Staking",
    mode: "Red",
    asset: "ETH",
    estimate: "Segun validador",
    minimum: "0.01 ETH",
    liquidity: "Ventana de salida",
    risk: "Medio alto",
    fee: "Validador/red",
    description: "Participacion sujeta a red.",
  },
  {
    id: "deco-token",
    title: "DECO Token",
    mode: "Ecosistema",
    asset: "DECO",
    estimate: "Por definir",
    minimum: "Por definir",
    liquidity: "Segun programa",
    risk: "Variable",
    fee: "Por definir",
    description: "Token propio con reglas especiales.",
  },
]

export const vaultPlans: VaultPlan[] = [
  { term: "30 dias", asset: "USDT", minimum: "20 USDT", estimate: "Proyeccion corta", exit: "Sin retiro anticipado", fee: "Incluida en neto" },
  { term: "60 dias", asset: "USDT", minimum: "20 USDT", estimate: "Proyeccion media", exit: "Condiciones visibles", fee: "Incluida en neto" },
  { term: "90 dias", asset: "USDC", minimum: "20 USDC", estimate: "Proyeccion amplia", exit: "Al vencimiento", fee: "Incluida en neto" },
]

export const reserveMetrics = [
  { label: "Fondos usuarios", value: "121.9M USDT", detail: "Pasivo total mock" },
  { label: "Reservas crypto", value: "104.8M USDT", detail: "Custodia on-chain" },
  { label: "Reservas fiat", value: "23.6M USDT", detail: "Bancos y rails" },
  { label: "Cobertura consolidada", value: "105.3%", detail: "Activos / usuarios" },
]

export const reserveCryptoAssets: ReserveAsset[] = [
  { asset: "USDT", total: "72.4M", users: "69.1M", locked: "11.8M", coverage: "104.8%", kind: "Crypto" },
  { asset: "USDC", total: "21.6M", users: "20.4M", locked: "3.2M", coverage: "105.9%", kind: "Crypto" },
  { asset: "BTC", total: "438 BTC", users: "421 BTC", locked: "39 BTC", coverage: "104.0%", kind: "Crypto" },
  { asset: "ETH", total: "6,280 ETH", users: "5,940 ETH", locked: "710 ETH", coverage: "105.7%", kind: "Crypto" },
]

export const reserveFiatAssets: ReserveAsset[] = [
  { asset: "COP", total: "18,400M", users: "17,210M", locked: "2,450M", coverage: "106.9%", kind: "Fiat" },
  { asset: "USD", total: "3.2M", users: "3.0M", locked: "420K", coverage: "106.7%", kind: "Fiat" },
  { asset: "MXN", total: "42.6M", users: "40.1M", locked: "5.4M", coverage: "106.2%", kind: "Fiat" },
  { asset: "EUR", total: "980K", users: "930K", locked: "110K", coverage: "105.4%", kind: "Fiat" },
]

export const reserveConsolidated = [
  { label: "Usuarios crypto", value: "98.4M USDT", detail: "Pasivo cripto" },
  { label: "Usuarios fiat", value: "23.5M USDT", detail: "Pasivo fiat" },
  { label: "Total usuarios", value: "121.9M USDT", detail: "Crypto + fiat" },
  { label: "Reservas declaradas", value: "128.4M USDT", detail: "Consolidado mock" },
]

export const myReserveItems = [
  { label: "Total equivalente", value: "2,252.50 USDT" },
  { label: "Crypto disponible", value: "1,240 USDT" },
  { label: "Fiat disponible", value: "2,850,000 COP" },
  { label: "Bloqueado", value: "300 USDC" },
]

export const userMerkleProof: MerkleProofItem[] = [
  { label: "Merkle root", value: "0x7f31...a9c4" },
  { label: "Mi leaf hash", value: "0x91b0...44de" },
  { label: "Snapshot", value: "27 Jun 2026 · 00:00 UTC" },
  { label: "Estado", value: "Incluido" },
]

export const userReserveBreakdown: UserReserveBreakdown[] = [
  {
    label: "Crypto",
    value: "1,240 USDT",
    detail: "Saldo disponible",
    share: "55.0%",
  },
  {
    label: "Fiat",
    value: "2,850,000 COP",
    detail: "Equiv. 712.50 USDT",
    share: "31.6%",
  },
  {
    label: "Bloqueado",
    value: "300 USDC",
    detail: "Boveda / garantia",
    share: "13.4%",
  },
]

export const userReserveShare = [
  { label: "Sobre fondos usuarios", value: "0.00185%", detail: "De 121.9M USDT" },
  { label: "Sobre reservas Deco", value: "0.00175%", detail: "De 128.4M USDT" },
]

export const rendimientoPositions: RendimientoPosition[] = [
  {
    id: "RND-2401",
    product: "USDT Staking",
    amount: "520 USDT",
    status: "Flexible",
    estimate: "Variable",
    nextStep: "Retiro disponible",
    asset: "USDT",
    mode: "Flexible",
    startedAt: "18 Jun 2026",
    endsAt: "Sin vencimiento",
    progress: 68,
    canWithdraw: true,
    fee: "Segun red",
  },
  {
    id: "RND-2402",
    product: "Boveda USDC",
    amount: "300 USDC",
    status: "60 dias",
    estimate: "Proyeccion media",
    nextStep: "Vence en 38 dias",
    asset: "USDC",
    mode: "Programada",
    startedAt: "04 Jun 2026",
    endsAt: "03 Ago 2026",
    progress: 36,
    canWithdraw: false,
    fee: "No disponible",
  },
]

export const rendimientoActivityEvents = [
  { id: "ACT-001", title: "Simulacion creada", detail: "USDT Staking · 520 USDT", status: "Completado", date: "18 Jun" },
  { id: "ACT-002", title: "Boveda programada", detail: "USDC · plazo 60 dias", status: "Activa", date: "04 Jun" },
  { id: "ACT-003", title: "Condiciones aceptadas", detail: "Riesgo variable y liquidez revisada", status: "Registrado", date: "04 Jun" },
]
