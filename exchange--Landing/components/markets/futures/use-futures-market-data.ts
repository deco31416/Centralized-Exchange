"use client"

import * as React from "react"
import { parseCompactMarketNumber } from "@/components/markets/market-number-format"
import { MarketDataService } from "@/services/MarketDataService"
import type { MarketOrderBook, MarketPairMetadata, MarketTicker, MarketTrade } from "@/types/markets"
import {
  futuresOrderBook,
  futuresPairs,
  futuresStats,
  futuresTrades,
  type FuturesOrderBookDisplay,
  type FuturesPair,
  type FuturesStat,
  type FuturesTradeDisplay,
} from "./futures-market-data"

const fallbackBySymbol = new Map(futuresPairs.map((pair) => [pair.symbol, pair]))

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value)
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

function fallbackTicker(symbol: string): MarketTicker | null {
  const pair = fallbackBySymbol.get(symbol)
  if (!pair) return null

  return {
    symbol,
    pair: pair.pair,
    price: Number(pair.price.replaceAll(",", "")),
    change24h: Number(pair.change.replace("%", "")),
    volume24h: parseCompactMarketNumber(pair.volume),
    updatedAt: new Date().toISOString(),
    stale: true,
  }
}

function leverageFor(symbol: string): string {
  return fallbackBySymbol.get(symbol)?.leverage ?? "25x"
}

function fundingFor(symbol: string): string {
  return fallbackBySymbol.get(symbol)?.funding ?? "0.0100%"
}

function mapPair(metadata: MarketPairMetadata, ticker: MarketTicker | null): FuturesPair {
  return {
    pair: metadata.pair,
    symbol: metadata.symbol,
    price: ticker ? formatPrice(ticker.price) : fallbackBySymbol.get(metadata.symbol)?.price ?? "0.00",
    change: ticker ? formatPercent(ticker.change24h) : fallbackBySymbol.get(metadata.symbol)?.change ?? "+0.00%",
    volume: ticker ? formatCompact(ticker.volume24h) : fallbackBySymbol.get(metadata.symbol)?.volume ?? "0",
    leverage: leverageFor(metadata.symbol),
    funding: fundingFor(metadata.symbol),
    provider: metadata.provider,
    market: metadata.market,
    tradingViewSymbol: metadata.tradingViewSymbol,
  }
}

function mapOrderBook(data: MarketOrderBook): FuturesOrderBookDisplay {
  return {
    asks: data.asks.slice(0, 4).map((level) => [
      formatPrice(level.price),
      level.amount.toFixed(2),
      formatCompact(level.total),
    ]),
    bids: data.bids.slice(0, 4).map((level) => [
      formatPrice(level.price),
      level.amount.toFixed(2),
      formatCompact(level.total),
    ]),
  }
}

function mapTrade(trade: MarketTrade): FuturesTradeDisplay {
  return {
    price: formatPrice(trade.price),
    amount: trade.amount.toFixed(2),
    side: trade.side === "buy" ? "Long" : "Short",
    time: new Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(trade.timestamp)),
  }
}

function buildStats(activePair: FuturesPair, ticker: MarketTicker | null): FuturesStat[] {
  if (!ticker) return futuresStats

  return [
    { label: "Contrato activo", value: activePair.pair, detail: activePair.market },
    { label: "Funding", value: activePair.funding, detail: "Próximo ciclo" },
    { label: "Open interest", value: formatCompact(ticker.volume24h * 3), detail: activePair.market },
    { label: "Riesgo cuenta", value: "Moderado", detail: "Margen 32%" },
  ]
}

export function useFuturesMarketData() {
  const [pairs, setPairs] = React.useState<FuturesPair[]>(futuresPairs)
  const [activePair, setActivePair] = React.useState<FuturesPair>(futuresPairs[0])
  const [stats, setStats] = React.useState<FuturesStat[]>(futuresStats)
  const [book, setBook] = React.useState<FuturesOrderBookDisplay>(futuresOrderBook)
  const [trades, setTrades] = React.useState<FuturesTradeDisplay[]>(futuresTrades)
  const [isLoading, setIsLoading] = React.useState(true)
  const [source, setSource] = React.useState<"backend" | "fallback">("fallback")

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const pairResponse = await MarketDataService.listPairs()
        const futuresMetadata = pairResponse.items.filter((pair) => pair.kind === "futures")
        const tickerResults = await Promise.allSettled(
          futuresMetadata.map((pair) => MarketDataService.getTicker(pair.symbol)),
        )
        const nextPairs = futuresMetadata.map((pair, index) => {
          const result = tickerResults[index]
          const ticker = result.status === "fulfilled" ? result.value : fallbackTicker(pair.symbol)
          return mapPair(pair, ticker)
        })
        const nextActive = nextPairs[0] ?? futuresPairs[0]
        const activeTicker = tickerResults[0]?.status === "fulfilled" ? tickerResults[0].value : fallbackTicker(nextActive.symbol)
        const [bookResponse, tradesResponse] = await Promise.all([
          MarketDataService.getOrderBook(nextActive.symbol, 4),
          MarketDataService.getTrades(nextActive.symbol, 4),
        ])

        if (cancelled) return

        setPairs(nextPairs.length ? nextPairs : futuresPairs)
        setActivePair(nextActive)
        setStats(buildStats(nextActive, activeTicker))
        setBook(mapOrderBook(bookResponse))
        setTrades(tradesResponse.items.map(mapTrade))
        setSource(pairResponse.source === "fallback" ? "fallback" : "backend")
      } catch {
        if (cancelled) return
        setPairs(futuresPairs)
        setActivePair(futuresPairs[0])
        setStats(futuresStats)
        setBook(futuresOrderBook)
        setTrades(futuresTrades)
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
    pairs,
    activePair,
    stats,
    orderBook: book,
    trades,
    isLoading,
    source,
  }
}
