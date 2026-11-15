"use client"

import { FuturesMarketCard } from "../futures-market-card"
import { PositionsPanel, RiskPanel } from "../futures-market-widgets"

export function FuturesPositionsView() {
  return (
    <div className="space-y-5">
      <FuturesMarketCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Gestión de posiciones</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Posiciones abiertas</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Controla tamaño, margen, PnL, precio de marca y liquidación antes de aumentar exposición.
        </p>
      </FuturesMarketCard>
      <RiskPanel />
      <PositionsPanel />
    </div>
  )
}
