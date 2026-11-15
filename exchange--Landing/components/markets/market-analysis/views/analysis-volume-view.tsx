"use client"

import type { AnalysisChartPair, AnalysisVolumeTrend } from "../market-analysis-data"
import { MarketAnalysisCard } from "../market-analysis-card"
import { AnalysisChart, VolumeTrendPanel } from "../market-analysis-widgets"

export function AnalysisVolumeView({ chartPair, volumeTrends }: { chartPair?: AnalysisChartPair; volumeTrends?: AnalysisVolumeTrend[] }) {
  return (
    <div className="space-y-5">
      <MarketAnalysisCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Volumen y tendencia</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Flujo por mercado</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Observa distribución de volumen entre Spot, Futuros y ecosistema antes de decidir dónde ejecutar.
        </p>
      </MarketAnalysisCard>
      <AnalysisChart pair={chartPair} />
      <VolumeTrendPanel trends={volumeTrends} />
    </div>
  )
}
