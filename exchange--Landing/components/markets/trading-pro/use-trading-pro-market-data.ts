"use client"

import * as React from "react"
import { MarketDataService } from "@/services/MarketDataService"
import type { MarketPairMetadata, MarketTicker } from "@/types/markets"
import {
  tradingProFallbackPair,
  tradingProStats,
  type TradingProPair,
  type TradingProStat,
} from "./trading-pro-data"

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

function mapPair(metadata: MarketPairMetadata, ticker: MarketTicker | null): TradingProPair {
  return {
    pair: metadata.kind === "futures" ? metadata.pair : metadata.pair,
    symbol: metadata.symbol,
    price: ticker ? formatPrice(ticker.price) : tradingProFallbackPair.price,
    change: ticker ? formatPercent(ticker.change24h) : tradingProFallbackPair.change,
    volume: ticker ? formatCompact(ticker.volume24h) : tradingProFallbackPair.volume,
    provider: metadata.provider,
    market: metadata.kind === "futures" ? "Futuros Pro" : metadata.market,
    tradingViewSymbol: metadata.tradingViewSymbol,
  }
}

function buildStats(pair: TradingProPair): TradingProStat[] {
  return [
    { label: "Modo activo", value: pair.market, detail: pair.pair },
    { label: "Estrategias", value: "4", detail: "Listas para configurar" },
    { label: "Órdenes vivas", value: "6", detail: "2 condicionadas" },
    { label: "Riesgo salida", value: "Cubierto", detail: "TP/SL disponible" },
  ]
}

export function useTradingProMarketData() {
  const [activePair, setActivePair] = React.useState<TradingProPair>(tradingProFallbackPair)
  const [stats, setStats] = React.useState<TradingProStat[]>(tradingProStats)
  const [isLoading, setIsLoading] = React.useState(true)
  const [source, setSource] = React.useState<"backend" | "fallback">("fallback")

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const pairResponse = await MarketDataService.listPairs()
        const preferred =
          pairResponse.items.find((pair) => pair.symbol === "BTCUSDT" && pair.kind === "spot") ??
          pairResponse.items.find((pair) => pair.symbol === "BTCUSDT") ??
          pairResponse.items[0]

        if (!preferred) {
          throw new Error("No market pairs available")
        }

        const ticker = await MarketDataService.getTicker(preferred.symbol).catch(() => null)
        const nextPair = mapPair(preferred, ticker)

        if (cancelled) return

        setActivePair(nextPair)
        setStats(buildStats(nextPair))
        setSource(pairResponse.source === "fallback" ? "fallback" : "backend")
      } catch {
        if (cancelled) return
        setActivePair(tradingProFallbackPair)
        setStats(tradingProStats)
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
    activePair,
    stats,
    isLoading,
    source,
  }
}
