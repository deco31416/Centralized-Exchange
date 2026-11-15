"use client"

import { PriceAlertsCard } from "../price-alerts-card"
import { ChannelsPanel } from "../price-alerts-widgets"

export function PriceAlertsChannelsView() {
  return (
    <div className="space-y-5">
      <PriceAlertsCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Canales</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Notificaciones por prioridad</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Define cómo se entrega cada alerta: app, email, push o futuros canales para traders avanzados.
        </p>
      </PriceAlertsCard>
      <ChannelsPanel />
    </div>
  )
}
