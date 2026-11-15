"use client"

import { openOrders } from "../spot-market-data"
import { SpotMarketCard } from "../spot-market-card"
import { OpenOrdersPanel, SpotOrderForm } from "../spot-market-widgets"

export function OrdersView() {
  return (
    <div className="space-y-5">
      <SpotMarketCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Gestion spot</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Ordenes abiertas</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Revisa ejecucion, fills parciales y ordenes activas antes de enviar una nueva instruccion al libro.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["Activas", String(openOrders.length)],
              ["Parcial", "1"],
              ["Fill promedio", "45%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background px-3 py-2">
                <p className="text-muted-foreground">{label}</p>
                <p className="text-lg font-black text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </SpotMarketCard>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <OpenOrdersPanel />
        <SpotOrderForm />
      </div>
    </div>
  )
}
