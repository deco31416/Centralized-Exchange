"use client"

import type { AnalysisWatchlistRow } from "../market-analysis-data"
import { MarketAnalysisCard } from "../market-analysis-card"
import { WatchlistPanel } from "../market-analysis-widgets"

export function AnalysisWatchlistView({ rows }: { rows?: AnalysisWatchlistRow[] }) {
  return (
    <div className="space-y-5">
      <MarketAnalysisCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Watchlist</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Activos bajo seguimiento</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Pares, condiciones y rutas naturales para pasar de análisis a ejecución.
        </p>
      </MarketAnalysisCard>
      <WatchlistPanel rows={rows} />
    </div>
  )
}
