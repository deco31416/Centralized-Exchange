import {
  Activity,
  BarChart3,
  Gauge,
  LayoutDashboard,
  ListChecks,
  ShieldAlert,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { MarketChartProvider } from "@/types/markets"

export type FuturesMarketView = "summary" | "terminal" | "positions" | "risk" | "history"
export type FuturesSide = "Long" | "Short"

export type FuturesStat = {
  label: string
  value: string
  detail: string
}

export type FuturesPair = {
  pair: string
  symbol: string
  price: string
  change: string
  volume: string
  leverage: string
  funding: string
  provider: MarketChartProvider
  market: string
  tradingViewSymbol?: string
}

export type FuturesOrderBookDisplay = {
  asks: [string, string, string][]
  bids: [string, string, string][]
}

export type FuturesTradeDisplay = {
  price: string
  amount: string
  side: FuturesSide
  time: string
}

export type FuturesPosition = {
  id: string
  pair: string
  side: FuturesSide
  size: string
  entry: string
  mark: string
  pnl: string
  margin: string
  leverage: string
  liquidation: string
  risk: string
}

export const futuresNav: Array<{ name: string; view: FuturesMarketView; icon: LucideIcon }> = [
  { name: "Resumen", view: "summary", icon: LayoutDashboard },
  { name: "Terminal", view: "terminal", icon: BarChart3 },
  { name: "Posiciones", view: "positions", icon: Activity },
  { name: "Riesgo", view: "risk", icon: ShieldAlert },
  { name: "Historial", view: "history", icon: ListChecks },
]

export const futuresStats: FuturesStat[] = [
  { label: "Contrato activo", value: "BTCUSDT Perp", detail: "USDT-M" },
  { label: "Funding", value: "0.0100%", detail: "Próximo en 04:12:08" },
  { label: "Open interest", value: "3.8B", detail: "USDT" },
  { label: "Riesgo cuenta", value: "Moderado", detail: "Margen 32%" },
]

export const futuresPairs: FuturesPair[] = [
  { pair: "BTCUSDT Perp", symbol: "BTCUSDT", price: "67,438.10", change: "+2.24%", volume: "4.2B", leverage: "125x", funding: "0.0100%", provider: "TradingView", market: "USDT-M", tradingViewSymbol: "BINANCE:BTCUSDTPERP" },
  { pair: "ETHUSDT Perp", symbol: "ETHUSDT", price: "3,418.40", change: "+1.41%", volume: "1.6B", leverage: "100x", funding: "0.0085%", provider: "TradingView", market: "USDT-M", tradingViewSymbol: "BINANCE:ETHUSDTPERP" },
  { pair: "SOLUSDT Perp", symbol: "SOLUSDT", price: "148.60", change: "-0.62%", volume: "520M", leverage: "75x", funding: "-0.0020%", provider: "TradingView", market: "USDT-M", tradingViewSymbol: "BINANCE:SOLUSDTPERP" },
  { pair: "DECOUSDT Perp", symbol: "DECOUSDT", price: "0.3160", change: "+3.88%", volume: "24M", leverage: "10x", funding: "0.0000%", provider: "Deco Chart", market: "Ecosistema" },
]

export const futuresOrderBook: FuturesOrderBookDisplay = {
  asks: [
    ["67,444.20", "1.84", "124,060"],
    ["67,441.80", "3.12", "210,405"],
    ["67,439.30", "0.96", "64,741"],
    ["67,438.70", "1.24", "83,624"],
  ],
  bids: [
    ["67,437.80", "2.40", "161,850"],
    ["67,436.10", "1.76", "118,688"],
    ["67,433.90", "4.05", "273,107"],
    ["67,431.20", "2.62", "176,875"],
  ],
}

export const futuresTrades: FuturesTradeDisplay[] = [
  { price: "67,438.10", amount: "0.42", side: "Long", time: "12:18:44" },
  { price: "67,436.80", amount: "1.10", side: "Short", time: "12:18:31" },
  { price: "67,439.40", amount: "0.28", side: "Long", time: "12:18:25" },
  { price: "67,435.90", amount: "2.02", side: "Short", time: "12:18:12" },
]

export const openPositions: FuturesPosition[] = [
  { id: "POS-2401", pair: "BTCUSDT Perp", side: "Long" as FuturesSide, size: "0.80 BTC", entry: "66,920.00", mark: "67,438.10", pnl: "+414.48 USDT", margin: "1,820 USDT", leverage: "25x", liquidation: "63,180.00", risk: "Moderado" },
  { id: "POS-2398", pair: "ETHUSDT Perp", side: "Short" as FuturesSide, size: "6.20 ETH", entry: "3,452.00", mark: "3,418.40", pnl: "+208.32 USDT", margin: "980 USDT", leverage: "15x", liquidation: "3,730.00", risk: "Bajo" },
  { id: "POS-2392", pair: "DECOUSDT Perp", side: "Long" as FuturesSide, size: "80,000 DECO", entry: "0.3010", mark: "0.3160", pnl: "+1,200.00 USDT", margin: "2,400 USDT", leverage: "10x", liquidation: "0.2520", risk: "Medio" },
]

export const futuresHistory = [
  { id: "FUT-8821", pair: "BTCUSDT Perp", side: "Long", type: "Market", price: "66,920.00", size: "0.80 BTC", status: "Ejecutada", fee: "8.03 USDT", time: "11:54:20" },
  { id: "FUT-8814", pair: "ETHUSDT Perp", side: "Short", type: "Limit", price: "3,452.00", size: "6.20 ETH", status: "Ejecutada", fee: "5.12 USDT", time: "10:38:02" },
  { id: "FUT-8809", pair: "SOLUSDT Perp", side: "Long", type: "Stop", price: "151.20", size: "180 SOL", status: "Cancelada", fee: "0.00 USDT", time: "09:44:17" },
]
