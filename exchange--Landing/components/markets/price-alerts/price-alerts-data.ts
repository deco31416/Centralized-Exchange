import {
  BellRing,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  PlusCircle,
  Radar,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type PriceAlertsView = "summary" | "create" | "active" | "channels" | "triggered"

export type PriceAlertStat = {
  label: string
  value: string
  detail: string
}

export type ActivePriceAlert = {
  id: string
  pair: string
  condition: string
  channel: string
  status: string
  route: string
  priority: string
}

export type TriggeredPriceAlert = {
  id: string
  pair: string
  condition: string
  result: string
  time: string
  action: string
}

export type PriceAlertChannel = {
  title: string
  detail: string
  status: string
}

export type PriceAlertTemplate = {
  title: string
  pair: string
  condition: string
  route: string
}

export type PriceAlertBuilder = {
  asset: string
  condition: string
  value: string
  channel: string
  frequency: string
  route: string
}

export const priceAlertsNav: Array<{ name: string; view: PriceAlertsView; icon: LucideIcon }> = [
  { name: "Resumen", view: "summary", icon: LayoutDashboard },
  { name: "Crear", view: "create", icon: PlusCircle },
  { name: "Activas", view: "active", icon: ListChecks },
  { name: "Canales", view: "channels", icon: Megaphone },
  { name: "Disparadas", view: "triggered", icon: Radar },
]

export const priceAlertStats: PriceAlertStat[] = [
  { label: "Alertas activas", value: "7", detail: "4 precio · 3 volumen" },
  { label: "Disparadas 24h", value: "3", detail: "2 Spot · 1 Futuros" },
  { label: "Canales", value: "3", detail: "App, email, push" },
  { label: "Par principal", value: "BTC/USDT", detail: "68,000 ruptura" },
]

export const activeAlerts: ActivePriceAlert[] = [
  { id: "ALR-3101", pair: "BTC/USDT", condition: "Precio mayor que 68,000", channel: "App + Email", status: "Activa", route: "Spot", priority: "Alta" },
  { id: "ALR-3098", pair: "ETH/USDT", condition: "Precio toca 3,500", channel: "App", status: "Activa", route: "Trading Pro", priority: "Media" },
  { id: "ALR-3090", pair: "BTCUSDT Perp", condition: "Funding mayor que 0.012%", channel: "Push", status: "Activa", route: "Futuros", priority: "Alta" },
  { id: "ALR-3084", pair: "DECO/USDT", condition: "Volumen sube 20%", channel: "App + Email", status: "Observando", route: "Ecosistema", priority: "Media" },
]

export const triggeredAlerts: TriggeredPriceAlert[] = [
  { id: "TRG-7401", pair: "SOL/USDT", condition: "Precio menor que 149", result: "Disparada", time: "12:18", action: "Revisar corrección" },
  { id: "TRG-7396", pair: "BTC/USDT", condition: "Volumen +15%", result: "Disparada", time: "10:42", action: "Ver Spot" },
  { id: "TRG-7388", pair: "ETHUSDT Perp", condition: "Funding positivo", result: "Disparada", time: "09:30", action: "Ver Futuros" },
]

export const channels: PriceAlertChannel[] = [
  { title: "App Deco", detail: "Centro de notificaciones dentro del dashboard.", status: "Activo" },
  { title: "Email", detail: "Resumen de alertas importantes y disparadas.", status: "Activo" },
  { title: "Push móvil", detail: "Notificación inmediata para condiciones críticas.", status: "Mock" },
  { title: "Webhook", detail: "Canal futuro para traders avanzados y API.", status: "Próximo" },
]

export const alertTemplates: PriceAlertTemplate[] = [
  { title: "Ruptura de precio", pair: "BTC/USDT", condition: "Mayor que 68,000", route: "Spot" },
  { title: "Stop técnico", pair: "ETH/USDT", condition: "Menor que 3,350", route: "Trading Pro" },
  { title: "Funding alto", pair: "BTCUSDT Perp", condition: "Funding > 0.012%", route: "Futuros" },
  { title: "Volumen ecosistema", pair: "DECO/USDT", condition: "Volumen +20%", route: "Ecosistema" },
]

export const alertBuilderFallback: PriceAlertBuilder = {
  asset: "BTC/USDT",
  condition: "Precio mayor que",
  value: "68,000 USDT",
  channel: "App + Email",
  frequency: "Una vez",
  route: "Abrir Spot",
}
