import {
  BarChart3,
  BookOpen,
  Clock3,
  Heart,
  LayoutDashboard,
  ListChecks,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type SpotMarketView = "summary" | "terminal" | "pairs" | "orders" | "history" | "favorites"
export type SpotChartProvider = "TradingView" | "Deco Chart"

export type SpotMarketPair = {
  pair: string
  symbol: string
  base: string
  quote: string
  price: string
  change: string
  volume: string
  favorite: boolean
  provider: SpotChartProvider
  market: string
  tradingViewSymbol?: string
}

export type SpotStat = {
  label: string
  value: string
  detail: string
}

export type SpotOrderBookDisplay = {
  asks: [string, string, string][]
  bids: [string, string, string][]
}

export type SpotTradeDisplay = {
  price: string
  amount: string
  side: "buy" | "sell"
  time: string
}

export const spotNav: Array<{ name: string; view: SpotMarketView; icon: LucideIcon }> = [
  { name: "Resumen", view: "summary", icon: LayoutDashboard },
  { name: "Terminal", view: "terminal", icon: BarChart3 },
  { name: "Pares", view: "pairs", icon: BookOpen },
  { name: "Órdenes", view: "orders", icon: ListChecks },
  { name: "Historial", view: "history", icon: Clock3 },
  { name: "Favoritos", view: "favorites", icon: Heart },
]

export const spotStats: SpotStat[] = [
  { label: "Par activo", value: "BTC/USDT", detail: "Mercado principal" },
  { label: "Precio", value: "67,420.50", detail: "+2.18% 24h" },
  { label: "Volumen 24h", value: "1.28B", detail: "USDT operados" },
  { label: "Spread", value: "0.02%", detail: "Libro profundo" },
]

export const marketPairs: SpotMarketPair[] = [
  { pair: "BTC/USDT", symbol: "BTCUSDT", base: "BTC", quote: "USDT", price: "67,420.50", change: "+2.18%", volume: "1.28B", favorite: true, provider: "TradingView", market: "Principal", tradingViewSymbol: "BINANCE:BTCUSDT" },
  { pair: "ETH/USDT", symbol: "ETHUSDT", base: "ETH", quote: "USDT", price: "3,412.80", change: "+1.34%", volume: "840M", favorite: true, provider: "TradingView", market: "Principal", tradingViewSymbol: "BINANCE:ETHUSDT" },
  { pair: "SOL/USDT", symbol: "SOLUSDT", base: "SOL", quote: "USDT", price: "148.22", change: "-0.74%", volume: "210M", favorite: false, provider: "TradingView", market: "Altcoin", tradingViewSymbol: "BINANCE:SOLUSDT" },
  { pair: "DECO/USDT", symbol: "DECOUSDT", base: "DECO", quote: "USDT", price: "0.3141", change: "+4.20%", volume: "18M", favorite: true, provider: "Deco Chart", market: "Ecosistema" },
  { pair: "DECOX/USDT", symbol: "DECOXUSDT", base: "DECOX", quote: "USDT", price: "0.0908", change: "+1.90%", volume: "9M", favorite: true, provider: "Deco Chart", market: "Ecosistema" },
  { pair: "BNB/USDT", symbol: "BNBUSDT", base: "BNB", quote: "USDT", price: "612.10", change: "+0.62%", volume: "320M", favorite: false, provider: "TradingView", market: "Principal", tradingViewSymbol: "BINANCE:BNBUSDT" },
]

export const orderBook: SpotOrderBookDisplay = {
  asks: [
    ["67,426.20", "0.842", "56,760"],
    ["67,424.80", "1.120", "75,515"],
    ["67,422.10", "0.536", "36,132"],
    ["67,420.90", "0.224", "15,102"],
  ],
  bids: [
    ["67,419.80", "0.640", "43,148"],
    ["67,418.30", "1.406", "94,789"],
    ["67,416.70", "0.772", "52,046"],
    ["67,414.20", "2.100", "141,570"],
  ],
}

export const recentTrades: SpotTradeDisplay[] = [
  { price: "67,420.50", amount: "0.032", side: "buy", time: "12:04:18" },
  { price: "67,419.90", amount: "0.118", side: "sell", time: "12:04:12" },
  { price: "67,421.20", amount: "0.044", side: "buy", time: "12:04:08" },
  { price: "67,418.70", amount: "0.256", side: "sell", time: "12:03:59" },
]

export const openOrders = [
  { id: "SP-9012", pair: "BTC/USDT", side: "Compra", type: "Limit", price: "66,800.00", amount: "0.25", filled: "0%", status: "Abierta", time: "12:02:44" },
  { id: "SP-9011", pair: "ETH/USDT", side: "Venta", type: "Limit", price: "3,520.00", amount: "1.80", filled: "35%", status: "Parcial", time: "11:48:10" },
  { id: "SP-9008", pair: "DECO/USDT", side: "Compra", type: "Market", price: "0.3141", amount: "8,000", filled: "100%", status: "Ejecutada", time: "11:20:31" },
]

export const orderHistory = [
  { id: "TR-4481", pair: "BTC/USDT", side: "Compra", price: "67,102.40", amount: "0.15", status: "Ejecutada", fee: "6.71 USDT", time: "10:42:11" },
  { id: "TR-4478", pair: "DECO/USDT", side: "Venta", price: "0.3220", amount: "4,000", status: "Ejecutada", fee: "1.28 USDT", time: "09:58:22" },
  { id: "TR-4472", pair: "SOL/USDT", side: "Compra", price: "146.80", amount: "18", status: "Cancelada", fee: "0.00 USDT", time: "09:10:03" },
  { id: "TR-4469", pair: "ETH/USDT", side: "Venta", price: "3,488.40", amount: "0.80", status: "Parcial", fee: "2.79 USDT", time: "08:44:51" },
]
