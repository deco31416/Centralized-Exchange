"use client"

import type { AnalysisOpportunity } from "../market-analysis-data"
import { MarketAnalysisCard } from "../market-analysis-card"
import { OpportunitiesPanel, SentimentPanel } from "../market-analysis-widgets"

export function AnalysisOpportunitiesView({ opportunities }: { opportunities?: AnalysisOpportunity[] }) {
  return (
    <div className="space-y-5">
      <MarketAnalysisCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Señales visuales</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Oportunidades sin prometer rendimiento</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Lecturas de mercado para investigar mejor. No son recomendación financiera ni garantía de resultado.
        </p>
      </MarketAnalysisCard>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <OpportunitiesPanel items={opportunities} />
        <SentimentPanel />
      </div>
    </div>
  )
}
