import {
  BarChart3,
  BriefcaseBusiness,
  HandCoins,
  History,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Store,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type MarketMakerView =
  | "dashboard"
  | "otc-market"
  | "offers"
  | "deco-liquidity"
  | "agreements"
  | "chat"
  | "settings"

export type OtcOffer = {
  id: string
  maker: string
  asset: string
  side: "Vende" | "Compra"
  available: string
  spread: string
  country: string
  minTicket: string
  responseTime: string
  status?: "Activa" | "Pausada" | "En revisión" | "Expirada"
  settlement?: string
  rail?: string
}

export type DecoProposal = {
  asset: string
  amount: string
  makerRate: string
  decoTarget: string
  decoMargin: string
  settlement: string
}

export type AgreementRow = {
  id: string
  asset: string
  amount: string
  status: "Pendiente" | "Aceptado" | "En liquidación" | "Liquidado" | "Cancelado"
  makerRate: string
  decoTarget: string
  margin: string
  settlement: string
}

export type ChatThread = {
  id: string
  title: string
  status: string
  summary: string
  asset: string
  amount: string
  terms: string
  messages: Array<{ from: "Deco Liquidity" | "Maker"; text: string }>
}

export const marketMakerNav: Array<{
  name: string
  view: MarketMakerView
  icon: LucideIcon
}> = [
  { name: "Dashboard", view: "dashboard", icon: LayoutDashboard },
  { name: "Mercado OTC", view: "otc-market", icon: BarChart3 },
  { name: "Mis Ofertas", view: "offers", icon: Store },
  { name: "Proveer a Deco", view: "deco-liquidity", icon: HandCoins },
  { name: "Acuerdos", view: "agreements", icon: History },
  { name: "Chat", view: "chat", icon: MessageSquare },
  { name: "Configuración", view: "settings", icon: Settings },
]

export const otcOffers: OtcOffer[] = [
  {
    id: "otc-001",
    maker: "Mesa Andina",
    asset: "USDT",
    side: "Vende",
    available: "100,000,000",
    spread: "-3%",
    country: "Colombia",
    minTicket: "10,000 USDT",
    responseTime: "15 min",
    settlement: "T+0",
    rail: "Bancario",
  },
  {
    id: "otc-002",
    maker: "Global Liquidity",
    asset: "BTC",
    side: "Compra",
    available: "250 BTC",
    spread: "+1.2%",
    country: "Global",
    minTicket: "1 BTC",
    responseTime: "30 min",
    settlement: "T+1",
    rail: "Crypto",
  },
  {
    id: "otc-003",
    maker: "Stable Desk",
    asset: "USDC",
    side: "Vende",
    available: "25,000,000",
    spread: "-1.5%",
    country: "Estados Unidos",
    minTicket: "50,000 USDC",
    responseTime: "20 min",
    settlement: "T+0 / T+1",
    rail: "Bancario",
  },
]

export const myOffers: OtcOffer[] = [
  {
    id: "my-001",
    maker: "Mi mesa OTC",
    asset: "USDT",
    side: "Vende",
    available: "100,000,000",
    spread: "-3%",
    country: "Colombia",
    minTicket: "10,000 USDT",
    responseTime: "15 min",
    status: "Activa",
    settlement: "T+0",
    rail: "PSE / banco",
  },
  {
    id: "my-002",
    maker: "Mi mesa OTC",
    asset: "BTC",
    side: "Compra",
    available: "30 BTC",
    spread: "+0.8%",
    country: "Global",
    minTicket: "0.5 BTC",
    responseTime: "25 min",
    status: "Pausada",
    settlement: "T+1",
    rail: "Crypto",
  },
]

export const decoProposal: DecoProposal = {
  asset: "USDT",
  amount: "100,000,000",
  makerRate: "+1%",
  decoTarget: "+3%",
  decoMargin: "2%",
  settlement: "T+0 / T+1",
}

export const agreementRows: AgreementRow[] = [
  { id: "AGR-1042", asset: "USDT", amount: "15,000,000", status: "Pendiente", makerRate: "+1%", decoTarget: "+3%", margin: "2%", settlement: "T+0" },
  { id: "AGR-1038", asset: "USDC", amount: "5,000,000", status: "Aceptado", makerRate: "+0.8%", decoTarget: "+2.2%", margin: "1.4%", settlement: "T+1" },
  { id: "AGR-1029", asset: "BTC", amount: "45 BTC", status: "Liquidado", makerRate: "+0.4%", decoTarget: "+1.3%", margin: "0.9%", settlement: "T+0" },
]

export const makerStats = [
  { label: "Liquidez declarada", value: "100M USDT", detail: "Capacidad visible" },
  { label: "Precio preferencial", value: "-3%", detail: "Oferta OTC" },
  { label: "Margen Deco", value: "2%", detail: "Proyección comercial" },
  { label: "Ingreso estimado", value: "+1%", detail: "Para la mesa" },
]

export const chatThreads: ChatThread[] = [
  {
    id: "AGR-1042",
    title: "USDT Colombia",
    status: "Pendiente",
    summary: "15M USDT · ganancia estimada 2%",
    asset: "USDT",
    amount: "15M",
    terms: "+1% mesa · +3% venta",
    messages: [
      { from: "Deco Liquidity", text: "Podemos tomar 20M USDT iniciales para Colombia." },
      { from: "Maker", text: "Disponible. Precio para Deco: +1%, liquidación T+0." },
      { from: "Deco Liquidity", text: "Dejamos la propuesta pendiente de aprobación comercial." },
    ],
  },
  {
    id: "AGR-1038",
    title: "USDC Estados Unidos",
    status: "Aceptado",
    summary: "5M USDC · cierre T+1",
    asset: "USDC",
    amount: "5M",
    terms: "+0.8% mesa · +2.2% venta",
    messages: [
      { from: "Deco Liquidity", text: "Aprobamos cupo inicial de 5M USDC." },
      { from: "Maker", text: "Confirmo disponibilidad y ventana de liquidación." },
    ],
  },
]

export const productBadge = {
  label: "Nivel 3 · Explorador",
  icon: BriefcaseBusiness,
}
