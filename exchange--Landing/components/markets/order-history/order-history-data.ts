import {
  Download,
  FileSearch,
  Filter,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type OrderHistoryView = "overview" | "spot" | "futures" | "p2p" | "detail" | "export"
export type OrderMarket = "Spot" | "Futuros" | "P2P" | "Market Maker"

export const orderHistoryNav: Array<{ name: string; view: OrderHistoryView; icon: LucideIcon }> = [
  { name: "Resumen", view: "overview", icon: LayoutDashboard },
  { name: "Spot", view: "spot", icon: ListChecks },
  { name: "Futuros", view: "futures", icon: Filter },
  { name: "P2P / OTC", view: "p2p", icon: ReceiptText },
  { name: "Detalle", view: "detail", icon: FileSearch },
  { name: "Exportar", view: "export", icon: Download },
]

export const orderHistoryStats = [
  { label: "Órdenes totales", value: "184", detail: "Últimos 30 días" },
  { label: "Ejecutadas", value: "142", detail: "77% completadas" },
  { label: "Fees pagados", value: "328.42", detail: "USDT estimado" },
  { label: "Mercados", value: "4", detail: "Spot, Futuros, P2P, OTC" },
]

export const orderHistoryRows: Array<{
  id: string
  market: OrderMarket
  pair: string
  side: string
  type: string
  status: string
  amount: string
  price: string
  fee: string
  time: string
  settlement: string
}> = [
  { id: "ORD-92044", market: "Spot", pair: "BTC/USDT", side: "Compra", type: "Limit", status: "Ejecutada", amount: "0.15 BTC", price: "67,102.40", fee: "6.71 USDT", time: "2026-06-25 10:42", settlement: "Instantáneo" },
  { id: "ORD-92031", market: "Futuros", pair: "BTCUSDT Perp", side: "Long", type: "Market", status: "Ejecutada", amount: "0.80 BTC", price: "66,920.00", fee: "8.03 USDT", time: "2026-06-25 09:54", settlement: "USDT-M" },
  { id: "ORD-91988", market: "P2P", pair: "USDT/COP", side: "Venta", type: "P2P", status: "Liquidada", amount: "2,500 USDT", price: "4,020 COP", fee: "0.00 USDT", time: "2026-06-24 18:12", settlement: "Bancolombia" },
  { id: "ORD-91940", market: "Market Maker", pair: "USDT Colombia", side: "Proveer", type: "OTC", status: "Pendiente", amount: "15M USDT", price: "+1%", fee: "Comercial", time: "2026-06-24 15:30", settlement: "T+0" },
  { id: "ORD-91870", market: "Spot", pair: "DECO/USDT", side: "Venta", type: "Market", status: "Ejecutada", amount: "4,000 DECO", price: "0.3220", fee: "1.28 USDT", time: "2026-06-24 11:18", settlement: "Instantáneo" },
  { id: "ORD-91795", market: "Futuros", pair: "ETHUSDT Perp", side: "Short", type: "Limit", status: "Parcial", amount: "6.20 ETH", price: "3,452.00", fee: "5.12 USDT", time: "2026-06-23 21:04", settlement: "USDT-M" },
]

export const selectedOrder = {
  id: "ORD-92044",
  market: "Spot",
  pair: "BTC/USDT",
  status: "Ejecutada",
  timeline: [
    ["Creada", "2026-06-25 10:40:12"],
    ["En libro", "2026-06-25 10:40:13"],
    ["Fill parcial", "2026-06-25 10:41:02"],
    ["Ejecutada", "2026-06-25 10:42:11"],
  ],
  fills: [
    { price: "67,090.00", amount: "0.05 BTC", fee: "2.23 USDT" },
    { price: "67,108.60", amount: "0.10 BTC", fee: "4.48 USDT" },
  ],
}

export const exportOptions = [
  { title: "CSV de órdenes", detail: "ID, mercado, par, estado, fee y timestamps.", status: "Listo" },
  { title: "PDF de actividad", detail: "Resumen visual para auditoría de usuario.", status: "Mock" },
  { title: "Reporte fiscal", detail: "Agrupado por mercado y moneda de liquidación.", status: "Próximo" },
]
