"use client"

import { Button } from "@/components/ui/button"
import type { ActivePriceAlert, PriceAlertBuilder, PriceAlertStat, PriceAlertsView, TriggeredPriceAlert } from "../price-alerts-data"
import { PriceAlertsCard } from "../price-alerts-card"
import { ActiveAlertsPanel, AlertBuilderPanel, ChannelsPanel, PriceAlertStatsGrid, TriggeredAlertsPanel } from "../price-alerts-widgets"

export function PriceAlertsSummaryView({
  onNavigate,
  stats,
  activeAlerts,
  triggeredAlerts,
  alertBuilder,
  dataSource = "fallback",
}: {
  onNavigate: (view: PriceAlertsView) => void
  stats?: PriceAlertStat[]
  activeAlerts?: ActivePriceAlert[]
  triggeredAlerts?: TriggeredPriceAlert[]
  alertBuilder?: PriceAlertBuilder
  dataSource?: "backend" | "fallback"
}) {
  return (
    <div className="space-y-5">
      <PriceAlertStatsGrid stats={stats} />

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          <PriceAlertsCard>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Resumen de alertas</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">Condiciones listas para avisar</h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  Monitorea precio, volumen, funding y eventos relevantes para volver a Spot, Futuros o Trading Pro en el momento correcto.
                </p>
                <p className="mt-2 text-xs font-bold text-muted-foreground">
                  Datos {dataSource === "backend" ? "conectados al BFF" : "en fallback de experiencia"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-full" onClick={() => onNavigate("create")}>Crear alerta</Button>
                <Button variant="outline" className="rounded-full" onClick={() => onNavigate("active")}>Ver activas</Button>
              </div>
            </div>
          </PriceAlertsCard>
          <ActiveAlertsPanel compact alerts={activeAlerts} />
        </div>
        <TriggeredAlertsPanel alerts={triggeredAlerts} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <AlertBuilderPanel builder={alertBuilder} />
        <ChannelsPanel />
      </div>
    </div>
  )
}
