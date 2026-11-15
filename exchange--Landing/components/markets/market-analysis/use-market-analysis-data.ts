"use client"

import * as React from "react"
import { parseCompactMarketNumber } from "@/components/markets/market-number-format"
import { MarketDataService } from "@/services/MarketDataService"
import type { MarketPairMetadata, MarketTicker } from "@/types/markets"
import {
  analysisFallbackChartPair,
  analysisStats,
  opportunities,
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

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value)
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

function signalFor(ticker: MarketTicker, pair: MarketPairMetadata): string {
  if (pair.kind === "ecosystem") return "Flujo interno"
  if (ticker.change24h >= 2) return "Tendencia fuerte"
  if (ticker.change24h < 0) return "Corrección corta"
  return "Rango limpio"
}

function marketLabel(pair: MarketPairMetadata): string {
  if (pair.kind === "futures") return "Futuros"
  if (pair.kind === "ecosystem") return "Ecosistema"
  return "Spot"
}

function mapMover(pair: MarketPairMetadata, ticker: MarketTicker): AnalysisMover {
  return {
    pair: pair.pair,
    price: formatPrice(ticker.price),
    change: formatPercent(ticker.change24h),
    volume: formatCompact(ticker.volume24h),
    market: marketLabel(pair),
    signal: signalFor(ticker, pair),
  }
}

function mapChartPair(pair: MarketPairMetadata, ticker: MarketTicker): AnalysisChartPair {
  return {
    pair: pair.pair,
    price: formatPrice(ticker.price),
    change: formatPercent(ticker.change24h),
    volume: formatCompact(ticker.volume24h),
    provider: pair.provider,
    market: marketLabel(pair),
    tradingViewSymbol: pair.tradingViewSymbol,
  }
}

function buildStats(movers: AnalysisMover[]): AnalysisStat[] {
  if (!movers.length) return analysisStats

  const strongest = movers[0]
  const totalVolume = movers.reduce((sum, item) => sum + parseCompactMarketNumber(item.volume), 0)

  const positiveCount = movers.filter((item) => item.change.startsWith("+")).length
  const marketTone = positiveCount >= movers.length / 2 ? "Alcista" : "Mixto"

  return [
    { label: "Mercado", value: marketTone, detail: "Lectura 24h" },
    { label: "Volumen total", value: formatCompact(totalVolume), detail: "USDT monitoreados" },
    { label: "Mayor fuerza", value: strongest.pair.split("/")[0].replace("USDT Perp", "BTC"), detail: `${strongest.change} 24h` },
    { label: "Alertas", value: "7", detail: "Condiciones activas" },
  ]
}

function buildVolumeTrends(movers: AnalysisMover[]): AnalysisVolumeTrend[] {
  if (!movers.length) return volumeTrends

  const segments = ["Spot", "Futuros", "Ecosistema"].map((segment) => {
    const rows = movers.filter((item) => item.market === segment)
    const total = rows.reduce((sum, item) => sum + parseCompactMarketNumber(item.volume), 0)
    return { segment, total }
  })
  const grandTotal = segments.reduce((sum, item) => sum + item.total, 0) || 1

  return segments.map(({ segment, total }) => ({
    segment,
    volume: formatCompact(total),
    change: segment === "Futuros" ? "+25%" : segment === "Spot" ? "+18%" : "+12%",
    dominance: `${Math.max(3, Math.round((total / grandTotal) * 100))}%`,
    note: segment === "Futuros" ? "Open interest sube." : segment === "Spot" ? "BTC y ETH lideran flujo." : "Tokens propios activos.",
  }))
}

function buildOpportunities(movers: AnalysisMover[]): AnalysisOpportunity[] {
  if (!movers.length) return opportunities

  return movers.slice(0, 4).map((item, index) => ({
    title: item.change.startsWith("+") ? `${item.pair} gana impulso` : `${item.pair} corrige con volumen`,
    pair: item.pair,
    action: index === 1 ? "Crear alerta" : item.market === "Futuros" ? "Revisar Futuros" : "Revisar Spot",
    confidence: item.change.startsWith("+") ? "Alta" : "Media",
    risk: item.market === "Ecosistema" ? "Variable" : item.change.startsWith("-") ? "Alto" : "Moderado",
    reason: item.signal,
  }))
}

function buildWatchlist(movers: AnalysisMover[]): AnalysisWatchlistRow[] {
  if (!movers.length) return watchlistRows

  return movers.slice(0, 4).map((item) => ({
    pair: item.pair,
    target: item.price,
    alert: item.change.startsWith("+") ? "Ruptura" : "Corrección",
    status: item.change.startsWith("+") ? "Activa" : "Observando",
    route: item.market,
  }))
}

export function useMarketAnalysisData() {
  const [chartPair, setChartPair] = React.useState<AnalysisChartPair>(analysisFallbackChartPair)
  const [stats, setStats] = React.useState<AnalysisStat[]>(analysisStats)
  const [movers, setMovers] = React.useState<AnalysisMover[]>(topMovers)
  const [volumes, setVolumes] = React.useState<AnalysisVolumeTrend[]>(volumeTrends)
  const [signals, setSignals] = React.useState<AnalysisOpportunity[]>(opportunities)
  const [watchlist, setWatchlist] = React.useState<AnalysisWatchlistRow[]>(watchlistRows)
  const [isLoading, setIsLoading] = React.useState(true)
  const [source, setSource] = React.useState<"backend" | "fallback">("fallback")

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const pairResponse = await MarketDataService.listPairs()
        const visiblePairs = pairResponse.items.filter((pair) => pair.kind !== "otc").slice(0, 8)
        const tickerResults = await Promise.allSettled(
          visiblePairs.map((pair) => MarketDataService.getTicker(pair.symbol)),
        )
        const mapped = visiblePairs
          .map((pair, index) => {
            const result = tickerResults[index]
            if (result.status !== "fulfilled") return null
            return { pair, ticker: result.value }
          })
          .filter((item): item is { pair: MarketPairMetadata; ticker: MarketTicker } => Boolean(item))
          .sort((a, b) => b.ticker.change24h - a.ticker.change24h)

        if (!mapped.length) throw new Error("No market tickers available")

        const nextMovers = mapped.map(({ pair, ticker }) => mapMover(pair, ticker))
        const lead = mapped[0]

        if (cancelled) return

        setChartPair(mapChartPair(lead.pair, lead.ticker))
        setMovers(nextMovers)
        setStats(buildStats(nextMovers))
        setVolumes(buildVolumeTrends(nextMovers))
        setSignals(buildOpportunities(nextMovers))
        setWatchlist(buildWatchlist(nextMovers))
        setSource(pairResponse.source === "fallback" ? "fallback" : "backend")
      } catch {
        if (cancelled) return
        setChartPair(analysisFallbackChartPair)
        setStats(analysisStats)
        setMovers(topMovers)
        setVolumes(volumeTrends)
        setSignals(opportunities)
        setWatchlist(watchlistRows)
        setSource("fallback")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    chartPair,
    stats,
    movers,
    volumeTrends: volumes,
    opportunities: signals,
    watchlistRows: watchlist,
    isLoading,
    source,
  }
}
