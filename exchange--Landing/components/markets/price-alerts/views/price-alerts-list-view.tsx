"use client"

import type { ActivePriceAlert, TriggeredPriceAlert } from "../price-alerts-data"
import { PriceAlertsCard } from "../price-alerts-card"
import { ActiveAlertsPanel, TriggeredAlertsPanel } from "../price-alerts-widgets"

export function PriceAlertsListView({
  triggered = false,
  activeAlerts,
  triggeredAlerts,
}: {
  triggered?: boolean
  activeAlerts?: ActivePriceAlert[]
  triggeredAlerts?: TriggeredPriceAlert[]
}) {
  return (
    <div className="space-y-5">
      <PriceAlertsCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{triggered ? "Historial" : "Seguimiento"}</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">{triggered ? "Alertas disparadas" : "Alertas activas"}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {triggered
            ? "Consulta condiciones que ya se cumplieron y su ruta natural de acción."
            : "Revisa reglas vigentes, prioridad, canal y mercado relacionado."}
        </p>
      </PriceAlertsCard>
      {triggered ? <TriggeredAlertsPanel alerts={triggeredAlerts} /> : <ActiveAlertsPanel alerts={activeAlerts} />}
    </div>
  )
}
