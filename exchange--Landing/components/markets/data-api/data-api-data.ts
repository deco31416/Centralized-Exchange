import {
  Activity,
  Gauge,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  ServerCog,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type DataApiView = "summary" | "keys" | "permissions" | "endpoints" | "logs"

export type DataApiStat = {
  label: string
  value: string
  detail: string
}

export type DataApiEndpoint = {
  method: string
  path: string
  detail: string
  latency: string
  status: string
}

export type DataApiLog = {
  id: string
  method: string
  path: string
  status: string
  time: string
  latency: string
}

export const dataApiNav: Array<{ name: string; view: DataApiView; icon: LucideIcon }> = [
  { name: "Resumen", view: "summary", icon: LayoutDashboard },
  { name: "Keys", view: "keys", icon: KeyRound },
  { name: "Permisos", view: "permissions", icon: LockKeyhole },
  { name: "Endpoints", view: "endpoints", icon: ServerCog },
  { name: "Logs", view: "logs", icon: Activity },
]

export const dataApiStats: DataApiStat[] = [
  { label: "Estado API", value: "Operativa", detail: "Market BFF listo" },
  { label: "Pares", value: "10", detail: "Spot, futuros y Deco" },
  { label: "Latencia p95", value: "84 ms", detail: "contrato vivo" },
  { label: "Rate limit", value: "1,200/min", detail: "plan pro" },
]

export const apiKeys = [
  { name: "Market data app", key: "deco_live_mkt_••••_9A42", scope: "read:market", status: "Activa", lastUsed: "Hace 2 min" },
  { name: "Trading terminal", key: "deco_live_trd_••••_71BC", scope: "read:market · trade:spot", status: "Activa", lastUsed: "Hace 18 min" },
  { name: "Research bot", key: "deco_test_res_••••_0F11", scope: "read:market · read:account", status: "Test", lastUsed: "Ayer" },
]

export const permissionGroups = [
  { title: "Read market", scope: "read:market", detail: "Ticker, candles, order book, trades y pares disponibles.", status: "Recomendado" },
  { title: "Read account", scope: "read:account", detail: "Balances, posiciones, historial y fees del usuario.", status: "Gateway user" },
  { title: "Trading", scope: "trade:spot / trade:futures", detail: "Crear/cancelar órdenes con validación de riesgo.", status: "Restringido" },
  { title: "Alerts", scope: "write:alerts", detail: "Crear y administrar alertas de precio o volumen.", status: "Próximo" },
]

export const endpointRows: DataApiEndpoint[] = [
  { method: "GET", path: "/api/markets/pairs", detail: "Pares Spot, Futuros y tokens Deco disponibles.", latency: "42 ms", status: "BFF activo" },
  { method: "GET", path: "/api/markets/ticker", detail: "Precio, cambio 24h y volumen por par.", latency: "42 ms", status: "BFF activo" },
  { method: "GET", path: "/api/markets/candles", detail: "OHLCV por par, intervalo y rango.", latency: "76 ms", status: "BFF activo" },
  { method: "GET", path: "/api/markets/order-book", detail: "Bids/asks y profundidad por mercado.", latency: "58 ms", status: "BFF activo" },
  { method: "GET", path: "/api/markets/trades", detail: "Últimas ejecuciones públicas.", latency: "49 ms", status: "BFF activo" },
  { method: "POST", path: "/api/user/orders", detail: "Crear orden desde gateway autenticado.", latency: "112 ms", status: "Gateway futuro" },
  { method: "POST", path: "/api/user/alerts", detail: "Crear alerta ligada al usuario.", latency: "96 ms", status: "Gateway futuro" },
]

export const requestLogs: DataApiLog[] = [
  { id: "REQ-88201", method: "GET", path: "/api/markets/ticker?symbol=BTCUSDT", status: "200", time: "12:32:18", latency: "38 ms" },
  { id: "REQ-88194", method: "GET", path: "/api/markets/candles?symbol=DECOUSDT", status: "200", time: "12:31:50", latency: "74 ms" },
  { id: "REQ-88188", method: "GET", path: "/api/markets/order-book?symbol=BTCUSDT", status: "200", time: "12:30:44", latency: "58 ms" },
  { id: "REQ-88160", method: "POST", path: "/api/user/orders", status: "401", time: "12:25:03", latency: "18 ms" },
]

export const gatewayContracts = [
  { title: "Auth user gateway", detail: "JWT/session valida usuario, KYC, país, permisos y límites." },
  { title: "Market BFF", detail: "`/api/markets/*` normaliza pairs, ticker, candles, order book y trades." },
  { title: "Risk guard", detail: "Valida órdenes, apalancamiento, límites y disponibilidad regulatoria." },
]
