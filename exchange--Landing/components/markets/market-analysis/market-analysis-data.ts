import {
  Activity,
  BarChart3,
  BellRing,
  LayoutDashboard,
  LineChart,
  Radar,
  Star,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { MarketChartProvider } from "@/types/markets"

export type MarketAnalysisView = "summary" | "movers" | "volume" | "opportunities" | "watchlist"

export type AnalysisStat = {
  label: string
  value: string
  detail: string
}

export type AnalysisMover = {
  pair: string
  price: string
  change: string
  volume: string
  market: string
  signal: string
}

export type AnalysisVolumeTrend = {
  segment: string
  volume: string
  change: string
  dominance: string
  note: string
}

export type AnalysisOpportunity = {
  title: string
  pair: string
  action: string
  confidence: string
  risk: string
  reason: string
}

export type AnalysisWatchlistRow = {
  pair: string
  target: string
  alert: string
  status: string
  route: string
}

export type AnalysisChartPair = {
  pair: string
  price: string
  change: string
  volume: string
  provider: MarketChartProvider
  market: string
  tradingViewSymbol?: string
}

export const marketAnalysisNav: Array<{ name: string; view: MarketAnalysisView; icon: LucideIcon }> = [
  { name: "Resumen", view: "summary", icon: LayoutDashboard },
  { name: "Movers", view: "movers", icon: Activity },
  { name: "Volumen", view: "volume", icon: BarChart3 },
  { name: "Oportunidades", view: "opportunities", icon: Radar },
  { name: "Watchlist", view: "watchlist", icon: Star },
]

export const analysisStats: AnalysisStat[] = [
  { label: "Mercado", value: "Alcista", detail: "Lectura 24h" },
  { label: "Volumen total", value: "4.8B", detail: "USDT monitoreados" },
  { label: "Mayor fuerza", value: "DECO", detail: "+4.20% 24h" },
  { label: "Alertas", value: "7", detail: "Condiciones activas" },
]

export const topMovers: AnalysisMover[] = [
  { pair: "DECO/USDT", price: "0.3141", change: "+4.20%", volume: "18M", market: "Ecosistema", signal: "Volumen creciente" },
  { pair: "BTC/USDT", price: "67,420.50", change: "+2.18%", volume: "1.28B", market: "Spot", signal: "Tendencia fuerte" },
  { pair: "ETH/USDT", price: "3,412.80", change: "+1.34%", volume: "840M", market: "Spot", signal: "Rango limpio" },
  { pair: "SOL/USDT", price: "148.22", change: "-0.74%", volume: "210M", market: "Spot", signal: "Corrección corta" },
  { pair: "DECOX/USDT", price: "0.0908", change: "+1.90%", volume: "9M", market: "Ecosistema", signal: "Demanda interna" },
]

export const volumeTrends: AnalysisVolumeTrend[] = [
  { segment: "Spot", volume: "2.12B", change: "+18%", dominance: "44%", note: "BTC y ETH lideran flujo." },
  { segment: "Futuros", volume: "2.54B", change: "+25%", dominance: "53%", note: "Open interest sube." },
  { segment: "Ecosistema", volume: "27M", change: "+12%", dominance: "3%", note: "Tokens propios activos." },
]

export const opportunities: AnalysisOpportunity[] = [
  { title: "BTC rompe rango corto", pair: "BTC/USDT", action: "Revisar Spot", confidence: "Alta", risk: "Moderado", reason: "Volumen y tendencia alineados." },
  { title: "ETH cerca de resistencia", pair: "ETH/USDT", action: "Crear alerta", confidence: "Media", risk: "Medio", reason: "Precio cerca de zona de venta." },
  { title: "DECO con flujo interno", pair: "DECO/USDT", action: "Ver token", confidence: "Media", risk: "Variable", reason: "Movimiento depende de liquidez propia." },
  { title: "SOL corrige con volumen", pair: "SOL/USDT", action: "Esperar confirmación", confidence: "Baja", risk: "Alto", reason: "Aún no recupera estructura." },
]

export const watchlistRows: AnalysisWatchlistRow[] = [
  { pair: "BTC/USDT", target: "68,000", alert: "Ruptura", status: "Activa", route: "Spot" },
  { pair: "ETH/USDT", target: "3,500", alert: "Resistencia", status: "Activa", route: "Trading Pro" },
  { pair: "DECO/USDT", target: "0.3300", alert: "Volumen", status: "Observando", route: "Ecosistema" },
  { pair: "BTCUSDT Perp", target: "0.012% funding", alert: "Funding", status: "Activa", route: "Futuros" },
]

export const sentimentRows = [
  ["Impulso", "72/100", "Compradores dominan corto plazo"],
  ["Liquidez", "68/100", "Spread estable en pares principales"],
  ["Riesgo", "41/100", "No operar sin confirmación en altcoins"],
]

export const analysisFallbackChartPair: AnalysisChartPair = {
  pair: "BTC/USDT",
  price: "67,420.50",
  change: "+2.18%",
  volume: "1.28B",
  provider: "TradingView",
  market: "Spot",
  tradingViewSymbol: "BINANCE:BTCUSDT",
}
