import {
  Activity,
  Crosshair,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { MarketChartProvider } from "@/types/markets"

export type TradingProView = "summary" | "standard" | "stop" | "oco" | "tpsl" | "activity"
export type TradingProOrderMode = "standard" | "stop" | "oco" | "tpsl"

export type TradingProPair = {
  pair: string
  symbol: string
  price: string
  change: string
  volume: string
  provider: MarketChartProvider
  market: string
  tradingViewSymbol?: string
}

export type TradingProStat = {
  label: string
  value: string
  detail: string
}

export const tradingProNav: Array<{ name: string; view: TradingProView; icon: LucideIcon }> = [
  { name: "Resumen", view: "summary", icon: LayoutDashboard },
  { name: "Limit / Market", view: "standard", icon: SlidersHorizontal },
  { name: "Stop-limit", view: "stop", icon: Crosshair },
  { name: "OCO", view: "oco", icon: GitBranch },
  { name: "TP/SL", view: "tpsl", icon: ShieldCheck },
  { name: "Actividad", view: "activity", icon: Activity },
]

export const tradingProStats: TradingProStat[] = [
  { label: "Modo activo", value: "Spot Pro", detail: "BTC/USDT" },
  { label: "Estrategias", value: "4", detail: "Listas para configurar" },
  { label: "Órdenes vivas", value: "6", detail: "2 condicionadas" },
  { label: "Riesgo salida", value: "Cubierto", detail: "TP/SL disponible" },
]

export const executionModes = [
  { title: "Limit / Market", view: "standard" as TradingProView, description: "Entrada directa", detail: "Precio fijo o ejecución inmediata.", status: "Disponible" },
  { title: "Stop-limit", view: "stop" as TradingProView, description: "Entrada condicional", detail: "Activa orden al tocar trigger.", status: "Configurado" },
  { title: "OCO", view: "oco" as TradingProView, description: "Doble salida", detail: "Take profit y stop en una sola lógica.", status: "Pro" },
  { title: "TP/SL", view: "tpsl" as TradingProView, description: "Protección posición", detail: "Salida automática por ganancia o pérdida.", status: "Listo" },
]

export const activeStrategies = [
  { id: "ADV-2101", pair: "BTC/USDT", mode: "OCO", side: "Venta", trigger: "TP 69,800 · SL 65,900", amount: "0.20 BTC", status: "Activa", time: "12:22:04" },
  { id: "ADV-2098", pair: "ETH/USDT", mode: "Stop-limit", side: "Compra", trigger: "Trigger 3,480 · Limit 3,486", amount: "1.50 ETH", status: "Pendiente", time: "11:40:12" },
  { id: "ADV-2091", pair: "BTCUSDT Perp", mode: "TP/SL", side: "Long", trigger: "TP +4.5% · SL -1.8%", amount: "0.80 BTC", status: "Protegida", time: "10:18:33" },
]

export const activityRows = [
  { id: "EXE-7720", pair: "BTC/USDT", mode: "Limit", result: "Ejecutada", price: "67,220.00", amount: "0.12 BTC", fee: "3.22 USDT", time: "09:44:20" },
  { id: "EXE-7714", pair: "ETH/USDT", mode: "Stop-limit", result: "Cancelada", price: "3,380.00", amount: "2.00 ETH", fee: "0.00 USDT", time: "08:51:04" },
  { id: "EXE-7708", pair: "SOL/USDT", mode: "OCO", result: "TP ejecutado", price: "152.80", amount: "120 SOL", fee: "5.50 USDT", time: "08:10:45" },
]

export const tradingProFallbackPair: TradingProPair = {
  pair: "BTC/USDT",
  symbol: "BTCUSDT",
  price: "67,420.50",
  change: "+2.18%",
  volume: "1.28B",
  provider: "TradingView",
  market: "Spot Pro",
  tradingViewSymbol: "BINANCE:BTCUSDT",
}
