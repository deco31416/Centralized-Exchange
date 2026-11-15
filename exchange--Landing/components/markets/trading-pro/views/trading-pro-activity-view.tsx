"use client"

import { activityRows } from "../trading-pro-data"
import { TradingProCard } from "../trading-pro-card"
import { ActiveStrategiesPanel } from "../trading-pro-widgets"

export function TradingProActivityView() {
  return (
    <div className="space-y-5">
      <ActiveStrategiesPanel />

      <TradingProCard>
        <h2 className="text-xl font-black text-foreground">Historial de ejecución</h2>
        <p className="mt-1 text-sm text-muted-foreground">Órdenes avanzadas ejecutadas, canceladas o resueltas por condición.</p>
        <div className="mt-4 grid gap-2">
          {activityRows.map((row) => (
            <div key={row.id} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] md:items-center">
              <span className="font-black text-foreground">{row.id}</span>
              <span className="text-muted-foreground">{row.pair}</span>
              <span className="text-muted-foreground">{row.mode}</span>
              <span className="text-muted-foreground">{row.amount} · {row.price}</span>
              <span className="text-muted-foreground">{row.time} · fee {row.fee}</span>
              <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground">{row.result}</span>
            </div>
          ))}
        </div>
      </TradingProCard>
    </div>
  )
}
