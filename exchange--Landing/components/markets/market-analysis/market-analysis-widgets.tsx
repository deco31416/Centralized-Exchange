"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketChart } from "../market-chart"
import { MarketAnalysisCard } from "./market-analysis-card"
import {
  analysisFallbackChartPair,
  analysisStats,
  opportunities,
  sentimentRows,
  topMovers,
  volumeTrends,
  watchlistRows,
  type AnalysisChartPair,
  type AnalysisMover,
  type AnalysisOpportunity,
  type AnalysisStat,
  type AnalysisVolumeTrend,
  type AnalysisWatchlistRow,
} from "./market-analysis-data"

export function AnalysisStatsGrid({ stats = analysisStats }: { stats?: AnalysisStat[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <MarketAnalysisCard key={stat.label} className="p-4">
          <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.detail}</p>
        </MarketAnalysisCard>
      ))}
    </div>
  )
}

export function AnalysisChart({ compact = false, pair = analysisFallbackChartPair }: { compact?: boolean; pair?: AnalysisChartPair }) {
  return <MarketChart pair={pair} compact={compact} />
}

export function MoversPanel({ compact = false, movers = topMovers }: { compact?: boolean; movers?: AnalysisMover[] }) {
  return (
    <MarketAnalysisCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Top movers</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">24h</span>
      </div>
      <div className="mt-4 grid gap-2">
        {movers.slice(0, compact ? 4 : movers.length).map((item) => (
          <div key={item.pair} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-sm">
            <div>
              <p className="font-black text-foreground">{item.pair}</p>
              <p className="text-xs text-muted-foreground">{item.market} · {item.signal}</p>
            </div>
            <span className="font-bold text-foreground">{item.price}</span>
            <span className={cn("text-xs font-black", item.change.startsWith("+") ? "text-emerald-500" : "text-red-500")}>{item.change}</span>
          </div>
        ))}
      </div>
    </MarketAnalysisCard>
  )
}

export function VolumeTrendPanel({ trends = volumeTrends }: { trends?: AnalysisVolumeTrend[] }) {
  return (
    <MarketAnalysisCard>
      <h3 className="text-lg font-black text-foreground">Volumen por mercado</h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {trends.map((item) => (
          <div key={item.segment} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{item.segment}</p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-emerald-500">{item.change}</span>
            </div>
            <p className="mt-4 text-2xl font-black text-foreground">{item.volume}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: item.dominance }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Dominancia {item.dominance}</p>
          </div>
        ))}
      </div>
    </MarketAnalysisCard>
  )
}

export function OpportunitiesPanel({ compact = false, items = opportunities }: { compact?: boolean; items?: AnalysisOpportunity[] }) {
  return (
    <MarketAnalysisCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Oportunidades</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">No es asesoría</span>
      </div>
      <div className="mt-4 grid gap-2">
        {items.slice(0, compact ? 3 : items.length).map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.pair} · {item.reason}</p>
              </div>
              <Button variant="outline" className="rounded-full">{item.action}</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">Confianza {item.confidence}</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">Riesgo {item.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </MarketAnalysisCard>
  )
}

export function SentimentPanel() {
  return (
    <MarketAnalysisCard>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Lectura rápida</p>
      <h3 className="mt-1 text-xl font-black text-foreground">Pulso del mercado</h3>
      <div className="mt-4 grid gap-2">
        {sentimentRows.map(([label, value, detail]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-foreground">{label}</p>
              <span className="font-black text-foreground">{value}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
    </MarketAnalysisCard>
  )
}

export function WatchlistPanel({ rows = watchlistRows }: { rows?: AnalysisWatchlistRow[] }) {
  return (
    <MarketAnalysisCard>
      <h3 className="text-lg font-black text-foreground">Watchlist operativa</h3>
      <div className="mt-4 grid gap-2">
        {rows.map((item) => (
          <div key={`${item.pair}-${item.alert}`} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            <span className="font-black text-foreground">{item.pair}</span>
            <span className="text-muted-foreground">{item.alert} · {item.target}</span>
            <span className="text-muted-foreground">{item.route}</span>
            <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground">{item.status}</span>
          </div>
        ))}
      </div>
    </MarketAnalysisCard>
  )
}
