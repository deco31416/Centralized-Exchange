"use client"

import type { AnalysisMover } from "../market-analysis-data"
import { MarketAnalysisCard } from "../market-analysis-card"
import { MoversPanel, SentimentPanel } from "../market-analysis-widgets"

export function AnalysisMoversView({ movers }: { movers?: AnalysisMover[] }) {
  return (
    <div className="space-y-5">
      <MarketAnalysisCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Movers 24h</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Ganadores y correcciones</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Identifica activos con movimiento, volumen y contexto suficiente para revisar antes de operar.
        </p>
      </MarketAnalysisCard>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <MoversPanel movers={movers} />
        <SentimentPanel />
      </div>
    </div>
  )
}
