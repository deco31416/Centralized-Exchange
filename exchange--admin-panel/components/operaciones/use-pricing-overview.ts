"use client"

import { useEffect, useState } from "react"

type PricingSummary = {
  totalAssets?: number
  totalPairs?: number
  fiat?: number
  crypto?: number
  launchpad?: number
}

type PriceItem = {
  priceUsd?: number
  source?: string
}

export type PricingOverview = {
  loading: boolean
  error: string | null
  assetCount: number
  pairCount: number
  fiatCount: number
  cryptoCount: number
  averagePriceUsd: string
}

export function formatPricingCount(value: number) {
  return value.toLocaleString("es-CO")
}

export function usePricingOverview(): PricingOverview {
  const [overview, setOverview] = useState<PricingOverview>({
    loading: true,
    error: null,
    assetCount: 0,
    pairCount: 0,
    fiatCount: 0,
    cryptoCount: 0,
    averagePriceUsd: "—",
  })

  useEffect(() => {
    let cancelled = false

    async function loadPricingOverview() {
      try {
        const [pricesRes, matrixRes] = await Promise.all([
          fetch("/api/pricing/prices/all", { cache: "no-store" }),
          fetch("/api/pricing/prices/matrix", { cache: "no-store" }),
        ])

        if (!pricesRes.ok || !matrixRes.ok) {
          throw new Error("Pricing no respondió por Gateway Admin")
        }

        const pricesPayload = await pricesRes.json()
        const matrixPayload = await matrixRes.json()
        const prices = Array.isArray(pricesPayload?.prices)
          ? (pricesPayload.prices as PriceItem[])
          : []
        const summary = (matrixPayload?.summary || {}) as PricingSummary
        const pairs = Array.isArray(matrixPayload?.pairs) ? matrixPayload.pairs : []
        const numericPrices = prices
          .map((price) => Number(price.priceUsd))
          .filter((price) => Number.isFinite(price) && price > 0)

        if (cancelled) return

        setOverview({
          loading: false,
          error: null,
          assetCount: summary.totalAssets || prices.length,
          pairCount: summary.totalPairs || pairs.length,
          fiatCount: summary.fiat || prices.filter((price) => price.source === "fiat" || price.source === "stablecoin").length,
          cryptoCount: summary.crypto || prices.filter((price) => price.source === "crypto" || price.source === "launchpad").length,
          averagePriceUsd: numericPrices.length
            ? `$${(numericPrices.reduce((sum, price) => sum + price, 0) / numericPrices.length).toFixed(2)}`
            : "—",
        })
      } catch (error) {
        if (cancelled) return

        setOverview({
          loading: false,
          error: error instanceof Error ? error.message : "No se pudo consultar pricing",
          assetCount: 0,
          pairCount: 0,
          fiatCount: 0,
          cryptoCount: 0,
          averagePriceUsd: "—",
        })
      }
    }

    loadPricingOverview()

    return () => {
      cancelled = true
    }
  }, [])

  return overview
}
