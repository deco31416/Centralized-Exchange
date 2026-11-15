"use client"

import { Button } from "@/components/ui/button"
import type { AnalysisChartPair, AnalysisMover, AnalysisOpportunity, AnalysisStat, AnalysisVolumeTrend, MarketAnalysisView } from "../market-analysis-data"
import { MarketAnalysisCard } from "../market-analysis-card"
import { AnalysisChart, AnalysisStatsGrid, MoversPanel, OpportunitiesPanel, SentimentPanel, VolumeTrendPanel } from "../market-analysis-widgets"

export function AnalysisSummaryView({
  onNavigate,
  chartPair,
  stats,
  movers,
  opportunities,
  volumeTrends,
  dataSource = "fallback",
}: {
  onNavigate: (view: MarketAnalysisView) => void
  chartPair?: AnalysisChartPair
  stats?: AnalysisStat[]
  movers?: AnalysisMover[]
  opportunities?: AnalysisOpportunity[]
  volumeTrends?: AnalysisVolumeTrend[]
  dataSource?: "backend" | "fallback"
}) {
  return (
    <div className="space-y-5">
      <AnalysisStatsGrid stats={stats} />

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <MarketAnalysisCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Resumen de mercado</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">Lectura antes de operar</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Compara tendencia, volumen, fuerza relativa y señales visuales antes de ir a Spot, Futuros o Trading Pro.
              </p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                Datos {dataSource === "backend" ? "conectados al BFF" : "en fallback de experiencia"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full" onClick={() => onNavigate("opportunities")}>Ver oportunidades</Button>
              <Button variant="outline" className="rounded-full" onClick={() => onNavigate("watchlist")}>Watchlist</Button>
            </div>
          </div>
          <div className="mt-5">
            <AnalysisChart compact pair={chartPair} />
          </div>
        </MarketAnalysisCard>

        <SentimentPanel />
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <MoversPanel compact movers={movers} />
        <OpportunitiesPanel compact items={opportunities} />
      </div>

      <VolumeTrendPanel trends={volumeTrends} />
    </div>
  )
}
