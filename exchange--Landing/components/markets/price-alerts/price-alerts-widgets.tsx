"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PriceAlertsCard } from "./price-alerts-card"
import {
  activeAlerts,
  alertBuilderFallback,
  alertTemplates,
  channels,
  priceAlertStats,
  triggeredAlerts,
  type ActivePriceAlert,
  type PriceAlertBuilder,
  type PriceAlertStat,
  type PriceAlertTemplate,
  type TriggeredPriceAlert,
} from "./price-alerts-data"

export function PriceAlertStatsGrid({ stats = priceAlertStats }: { stats?: PriceAlertStat[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <PriceAlertsCard key={stat.label} className="p-4">
          <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.detail}</p>
        </PriceAlertsCard>
      ))}
    </div>
  )
}

export function AlertBuilderPanel({ builder = alertBuilderFallback }: { builder?: PriceAlertBuilder }) {
  return (
    <PriceAlertsCard>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Crear alerta</p>
          <h3 className="mt-1 text-xl font-black text-foreground">Condición de mercado</h3>
          <p className="mt-1 text-sm text-muted-foreground">Mock listo para conectar a backend de alertas.</p>
        </div>
        <span className="w-fit rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">{builder.asset}</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[
          ["Activo", builder.asset],
          ["Condición", builder.condition],
          ["Valor", builder.value],
          ["Canal", builder.channel],
          ["Frecuencia", builder.frequency],
          ["Ruta", builder.route],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button className="rounded-full">Guardar alerta</Button>
        <Button variant="outline" className="rounded-full">Probar notificación</Button>
      </div>
    </PriceAlertsCard>
  )
}

export function AlertTemplatesPanel({ templates = alertTemplates }: { templates?: PriceAlertTemplate[] }) {
  return (
    <PriceAlertsCard>
      <h3 className="text-lg font-black text-foreground">Plantillas rápidas</h3>
      <div className="mt-4 grid gap-2">
        {templates.map((template) => (
          <button key={template.title} className="rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{template.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{template.pair} · {template.condition}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{template.route}</span>
            </div>
          </button>
        ))}
      </div>
    </PriceAlertsCard>
  )
}

export function ActiveAlertsPanel({ compact = false, alerts = activeAlerts }: { compact?: boolean; alerts?: ActivePriceAlert[] }) {
  const rows = compact ? alerts.slice(0, 3) : alerts

  return (
    <PriceAlertsCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Alertas activas</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{alerts.length} reglas</span>
      </div>
      <div className="mt-4 grid gap-2">
        {rows.map((alert) => (
          <div key={alert.id} className="rounded-xl border border-border bg-background p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{alert.pair}</p>
                <p className="mt-1 text-sm text-muted-foreground">{alert.condition}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-black", alert.status === "Activa" ? "bg-emerald-500 text-white" : "border border-border text-foreground")}>{alert.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{alert.channel}</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{alert.route}</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">Prioridad {alert.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </PriceAlertsCard>
  )
}

export function ChannelsPanel() {
  return (
    <PriceAlertsCard>
      <h3 className="text-lg font-black text-foreground">Canales de notificación</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {channels.map((channel) => (
          <div key={channel.title} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-black text-foreground">{channel.title}</h4>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{channel.status}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{channel.detail}</p>
          </div>
        ))}
      </div>
    </PriceAlertsCard>
  )
}

export function TriggeredAlertsPanel({ alerts = triggeredAlerts }: { alerts?: TriggeredPriceAlert[] }) {
  return (
    <PriceAlertsCard>
      <h3 className="text-lg font-black text-foreground">Alertas disparadas</h3>
      <div className="mt-4 grid gap-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            <span className="font-black text-foreground">{alert.pair}</span>
            <span className="text-muted-foreground">{alert.condition}</span>
            <span className="text-muted-foreground">{alert.time} · {alert.action}</span>
            <span className="w-fit rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">{alert.result}</span>
          </div>
        ))}
      </div>
    </PriceAlertsCard>
  )
}
