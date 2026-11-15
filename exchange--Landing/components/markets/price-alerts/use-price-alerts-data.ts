"use client"

import * as React from "react"
import { MarketDataService } from "@/services/MarketDataService"
import type { MarketPairMetadata, MarketTicker } from "@/types/markets"
import {
  activeAlerts,
  alertBuilderFallback,
  alertTemplates,
  priceAlertStats,
  triggeredAlerts,
  type ActivePriceAlert,
  type PriceAlertBuilder,
  type PriceAlertStat,
  type PriceAlertTemplate,
  type TriggeredPriceAlert,
} from "./price-alerts-data"

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value)
}

function routeFor(pair: MarketPairMetadata): string {
  if (pair.kind === "futures") return "Futuros"
  if (pair.kind === "ecosystem") return "Ecosistema"
  return "Spot"
}

function labelFor(pair: MarketPairMetadata): string {
  return pair.kind === "futures" ? "Funding alto" : pair.kind === "ecosystem" ? "Volumen ecosistema" : "Ruptura de precio"
}

function conditionFor(pair: MarketPairMetadata, ticker: MarketTicker): string {
  if (pair.kind === "futures") return "Funding > 0.012%"
  if (pair.kind === "ecosystem") return "Volumen +20%"
  const target = ticker.price * 1.01
  return `Mayor que ${formatPrice(target)}`
}

function mapTemplate(pair: MarketPairMetadata, ticker: MarketTicker): PriceAlertTemplate {
  return {
    title: labelFor(pair),
    pair: pair.pair,
    condition: conditionFor(pair, ticker),
    route: routeFor(pair),
  }
}

function mapActiveAlert(pair: MarketPairMetadata, ticker: MarketTicker, index: number): ActivePriceAlert {
  return {
    id: `ALR-${3101 - index}`,
    pair: pair.pair,
    condition: conditionFor(pair, ticker),
    channel: index % 2 === 0 ? "App + Email" : "App",
    status: pair.kind === "ecosystem" ? "Observando" : "Activa",
    route: routeFor(pair),
    priority: ticker.change24h >= 2 || pair.kind === "futures" ? "Alta" : "Media",
  }
}

function mapTriggered(pair: MarketPairMetadata, ticker: MarketTicker, index: number): TriggeredPriceAlert {
  return {
    id: `TRG-${7401 - index}`,
    pair: pair.pair,
    condition: ticker.change24h < 0 ? `Precio menor que ${formatPrice(ticker.price)}` : "Volumen +15%",
    result: "Disparada",
    time: ["12:18", "10:42", "09:30"][index] ?? "08:45",
    action: pair.kind === "futures" ? "Ver Futuros" : "Ver Spot",
  }
}

function buildStats(alerts: ActivePriceAlert[], triggered: TriggeredPriceAlert[], leadPair: string): PriceAlertStat[] {
  if (!alerts.length) return priceAlertStats

  return [
    { label: "Alertas activas", value: String(alerts.length), detail: "Precio, volumen y funding" },
    { label: "Disparadas 24h", value: String(triggered.length), detail: "Rutas listas para operar" },
    { label: "Canales", value: "3", detail: "App, email, push" },
    { label: "Par principal", value: leadPair, detail: "Condición dinámica" },
  ]
}

function buildBuilder(pair: MarketPairMetadata, ticker: MarketTicker): PriceAlertBuilder {
  return {
    asset: pair.pair,
    condition: pair.kind === "futures" ? "Funding mayor que" : "Precio mayor que",
    value: pair.kind === "futures" ? "0.012%" : `${formatPrice(ticker.price * 1.01)} ${pair.quote}`,
    channel: "App + Email",
    frequency: "Una vez",
    route: `Abrir ${routeFor(pair)}`,
  }
}

export function usePriceAlertsData() {
  const [stats, setStats] = React.useState<PriceAlertStat[]>(priceAlertStats)
  const [alerts, setAlerts] = React.useState<ActivePriceAlert[]>(activeAlerts)
  const [triggered, setTriggered] = React.useState<TriggeredPriceAlert[]>(triggeredAlerts)
  const [templates, setTemplates] = React.useState<PriceAlertTemplate[]>(alertTemplates)
  const [builder, setBuilder] = React.useState<PriceAlertBuilder>(alertBuilderFallback)
  const [isLoading, setIsLoading] = React.useState(true)
  const [source, setSource] = React.useState<"backend" | "fallback">("fallback")

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const pairResponse = await MarketDataService.listPairs()
        const visiblePairs = pairResponse.items.filter((pair) => pair.kind !== "otc").slice(0, 6)
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

        if (!mapped.length) throw new Error("No alert pairs available")

        const nextAlerts = mapped.slice(0, 4).map(({ pair, ticker }, index) => mapActiveAlert(pair, ticker, index))
        const nextTriggered = mapped.slice(1, 4).map(({ pair, ticker }, index) => mapTriggered(pair, ticker, index))
        const nextTemplates = mapped.slice(0, 4).map(({ pair, ticker }) => mapTemplate(pair, ticker))
        const lead = mapped[0]

        if (cancelled) return

        setAlerts(nextAlerts)
        setTriggered(nextTriggered)
        setTemplates(nextTemplates)
        setBuilder(buildBuilder(lead.pair, lead.ticker))
        setStats(buildStats(nextAlerts, nextTriggered, lead.pair.pair))
        setSource(pairResponse.source === "fallback" ? "fallback" : "backend")
      } catch {
        if (cancelled) return
        setStats(priceAlertStats)
        setAlerts(activeAlerts)
        setTriggered(triggeredAlerts)
        setTemplates(alertTemplates)
        setBuilder(alertBuilderFallback)
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
    activeAlerts: alerts,
    triggeredAlerts: triggered,
    alertTemplates: templates,
    alertBuilder: builder,
    isLoading,
    source,
  }
}
