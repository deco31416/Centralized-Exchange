"use client"

import * as React from "react"
import { MarketDataService } from "@/services/MarketDataService"
import {
  dataApiStats,
  endpointRows,
  requestLogs,
  type DataApiEndpoint,
  type DataApiLog,
  type DataApiStat,
} from "./data-api-data"

function nowTime(): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date())
}

function latency(start: number): string {
  return `${Math.max(1, Math.round(performance.now() - start))} ms`
}

function withLatency(rows: DataApiEndpoint[], measured: Record<string, string>): DataApiEndpoint[] {
  return rows.map((row) => ({
    ...row,
    latency: measured[row.path] ?? row.latency,
  }))
}

export function useDataApiStatus() {
  const [stats, setStats] = React.useState<DataApiStat[]>(dataApiStats)
  const [endpoints, setEndpoints] = React.useState<DataApiEndpoint[]>(endpointRows)
  const [logs, setLogs] = React.useState<DataApiLog[]>(requestLogs)
  const [isLoading, setIsLoading] = React.useState(true)
  const [source, setSource] = React.useState<"backend" | "fallback">("fallback")

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const measured: Record<string, string> = {}
        const tPairs = performance.now()
        const pairs = await MarketDataService.listPairs()
        measured["/api/markets/pairs"] = latency(tPairs)

        const tTicker = performance.now()
        await MarketDataService.getTicker("BTCUSDT")
        measured["/api/markets/ticker"] = latency(tTicker)

        const tCandles = performance.now()
        await MarketDataService.getCandles("BTCUSDT", "1d", 12)
        measured["/api/markets/candles"] = latency(tCandles)

        const tBook = performance.now()
        await MarketDataService.getOrderBook("BTCUSDT", 4)
        measured["/api/markets/order-book"] = latency(tBook)

        const tTrades = performance.now()
        await MarketDataService.getTrades("BTCUSDT", 5)
        measured["/api/markets/trades"] = latency(tTrades)

        if (cancelled) return

        setStats([
          { label: "Estado API", value: "Operativa", detail: "Market BFF listo" },
          { label: "Pares", value: String(pairs.count), detail: "Spot, futuros y Deco" },
          { label: "Latencia p95", value: measured["/api/markets/candles"], detail: "contrato vivo" },
          { label: "Rate limit", value: "1,200/min", detail: "plan pro" },
        ])
        setEndpoints(withLatency(endpointRows, measured))
        setLogs([
          { id: "REQ-LIVE-05", method: "GET", path: "/api/markets/trades?symbol=BTCUSDT", status: "200", time: nowTime(), latency: measured["/api/markets/trades"] },
          { id: "REQ-LIVE-04", method: "GET", path: "/api/markets/order-book?symbol=BTCUSDT", status: "200", time: nowTime(), latency: measured["/api/markets/order-book"] },
          { id: "REQ-LIVE-03", method: "GET", path: "/api/markets/candles?symbol=BTCUSDT", status: "200", time: nowTime(), latency: measured["/api/markets/candles"] },
          { id: "REQ-LIVE-02", method: "GET", path: "/api/markets/ticker?symbol=BTCUSDT", status: "200", time: nowTime(), latency: measured["/api/markets/ticker"] },
          { id: "REQ-LIVE-01", method: "GET", path: "/api/markets/pairs", status: "200", time: nowTime(), latency: measured["/api/markets/pairs"] },
        ])
        setSource(pairs.source === "fallback" ? "fallback" : "backend")
      } catch {
        if (cancelled) return
        setStats(dataApiStats)
        setEndpoints(endpointRows)
        setLogs(requestLogs)
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
    stats,
    endpoints,
    logs,
    isLoading,
    source,
  }
}
