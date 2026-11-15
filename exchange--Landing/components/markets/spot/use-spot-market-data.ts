"use client"

import * as React from "react"
import { parseCompactMarketNumber } from "@/components/markets/market-number-format"
import { MarketDataService } from "@/services/MarketDataService"
import type { MarketOrderBook, MarketPairMetadata, MarketTicker, MarketTrade } from "@/types/markets"
import {
  marketPairs,
  orderBook,
  recentTrades,
  spotStats,
  type SpotMarketPair,
  type SpotOrderBookDisplay,
  type SpotStat,
  type SpotTradeDisplay,
} from "./spot-market-data"

const favoriteSymbols = new Set(marketPairs.filter((pair) => pair.favorite).map((pair) => pair.symbol))

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

function fallbackTicker(symbol: string): MarketTicker | null {
  const pair = marketPairs.find((item) => item.symbol === symbol)
  if (!pair) return null

  return {
    symbol: pair.symbol,
    pair: pair.pair,
    price: Number(pair.price.replaceAll(",", "")),
    change24h: Number(pair.change.replace("%", "")),
    volume24h: parseCompactMarketNumber(pair.volume),
    updatedAt: new Date().toISOString(),
    stale: true,
  }
}

function mapPair(metadata: MarketPairMetadata, ticker: MarketTicker | null): SpotMarketPair {
  return {
    pair: metadata.pair,
    symbol: metadata.symbol,
    base: metadata.base,
    quote: metadata.quote,
    price: ticker ? formatPrice(ticker.price) : "0.00",
    change: ticker ? formatPercent(ticker.change24h) : "+0.00%",
    volume: ticker ? formatCompact(ticker.volume24h) : "0",
    favorite: favoriteSymbols.has(metadata.symbol),
    provider: metadata.provider,
    market: metadata.market,
    tradingViewSymbol: metadata.tradingViewSymbol,
  }
}

function mapOrderBook(data: MarketOrderBook): SpotOrderBookDisplay {
  return {
    asks: data.asks.slice(0, 4).map((level) => [
      formatPrice(level.price),
      level.amount.toFixed(3),
      formatCompact(level.total),
    ]),
    bids: data.bids.slice(0, 4).map((level) => [
      formatPrice(level.price),
      level.amount.toFixed(3),
      formatCompact(level.total),
    ]),
  }
}

function mapTrade(trade: MarketTrade): SpotTradeDisplay {
  return {
    price: formatPrice(trade.price),
    amount: trade.amount.toFixed(3),
    side: trade.side,
    time: new Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(trade.timestamp)),
  }
}

function buildStats(activePair: SpotMarketPair, ticker: MarketTicker | null): SpotStat[] {
  if (!ticker) return spotStats

  return [
    { label: "Par activo", value: activePair.pair, detail: activePair.market },
    { label: "Precio", value: formatPrice(ticker.price), detail: `${formatPercent(ticker.change24h)} 24h` },
    { label: "Volumen 24h", value: formatCompact(ticker.volume24h), detail: `${activePair.quote} operados` },
    { label: "Spread", value: "0.02%", detail: "Libro profundo" },
  ]
}

export function useSpotMarketData() {
  const [pairs, setPairs] = React.useState<SpotMarketPair[]>(marketPairs)
  const [activePair, setActivePair] = React.useState<SpotMarketPair>(marketPairs[0])
  const [stats, setStats] = React.useState<SpotStat[]>(spotStats)
  const [book, setBook] = React.useState<SpotOrderBookDisplay>(orderBook)
  const [trades, setTrades] = React.useState<SpotTradeDisplay[]>(recentTrades)
  const [isLoading, setIsLoading] = React.useState(true)
  const [source, setSource] = React.useState<"backend" | "fallback">("fallback")

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const pairResponse = await MarketDataService.listPairs()
        const pairMetadata = pairResponse.items.filter((pair) => pair.kind === "spot" || pair.kind === "ecosystem")
        const tickerResults = await Promise.allSettled(
          pairMetadata.map((pair) => MarketDataService.getTicker(pair.symbol)),
        )
        const nextPairs = pairMetadata.map((pair, index) => {
          const result = tickerResults[index]
          const ticker = result.status === "fulfilled" ? result.value : fallbackTicker(pair.symbol)
          return mapPair(pair, ticker)
        })
        const nextActive = nextPairs[0] ?? marketPairs[0]
        const activeTicker = tickerResults[0]?.status === "fulfilled" ? tickerResults[0].value : fallbackTicker(nextActive.symbol)

        const [bookResponse, tradesResponse] = await Promise.all([
          MarketDataService.getOrderBook(nextActive.symbol, 4),
          MarketDataService.getTrades(nextActive.symbol, 4),
        ])

        if (cancelled) return

        setPairs(nextPairs.length ? nextPairs : marketPairs)
        setActivePair(nextActive)
        setStats(buildStats(nextActive, activeTicker))
        setBook(mapOrderBook(bookResponse))
        setTrades(tradesResponse.items.map(mapTrade))
        setSource(pairResponse.source === "fallback" ? "fallback" : "backend")
      } catch {
        if (cancelled) return
        setPairs(marketPairs)
        setActivePair(marketPairs[0])
        setStats(spotStats)
        setBook(orderBook)
        setTrades(recentTrades)
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
    recentTrades: trades,
    isLoading,
    source,
  }
}
