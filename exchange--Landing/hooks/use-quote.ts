"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface ConversionResult {
  from: string
  to: string
  rate: number
  inverseRate: number
  amount: number
  converted: number
  fromPriceUsd: number
  toPriceUsd: number
  timestamp: string
}

interface QuoteState {
  data: ConversionResult | null
  loading: boolean
  error: string | null
}

/**
 * Obtiene una cotización en tiempo real desde el BFF pricing-aggregator.
 * Se actualiza automáticamente cuando cambian from, to o amount.
 * Solo solicita si amount > 0.
 */
export function useQuote(from: string, to: string, amount: number) {
  const [state, setState] = useState<QuoteState>({ data: null, loading: false, error: null })
  const abortRef = useRef<AbortController | null>(null)

  const fetch_quote = useCallback(
    async (f: string, t: string, a: number) => {
      if (!f || !t || a <= 0) {
        setState({ data: null, loading: false, error: null })
        return
      }
      // Cancelar petición anterior
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const res = await fetch(
          `/api/prices/convert/${encodeURIComponent(f)}/${encodeURIComponent(t)}?amount=${a}`,
          { cache: "no-store", signal: abortRef.current.signal },
        )
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message ?? `Error ${res.status}`)
        }
        const data: ConversionResult = await res.json()
        setState({ data, loading: false, error: null })
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return
        setState({ data: null, loading: false, error: (err as Error).message || "Error al obtener cotización" })
      }
    },
    [],
  )

  useEffect(() => {
    fetch_quote(from, to, amount)
    return () => { abortRef.current?.abort() }
  }, [from, to, amount, fetch_quote])

  const refresh = useCallback(() => fetch_quote(from, to, amount), [from, to, amount, fetch_quote])

  return { ...state, refresh }
}

interface UnifiedPrice {
  assetCode: string
  priceUsd: number
  invertedRate: number
  priceChange24h: number
  source: "fiat" | "crypto" | "launchpad" | "stablecoin" | "internal"
  stale: boolean
  updatedAt: string
  metadata?: {
    name?: string
    iconUrl?: string
    logoUrl?: string
    category?: string
    canBuy?: boolean
    enabled?: boolean
    isInternal?: boolean
    isRepresentativeBalance?: boolean
  }
}

export interface AssetOption {
  code: string
  label: string
  name: string
  source: UnifiedPrice["source"]
  iconUrl?: string
  logoUrl?: string
  category?: string
  canBuy: boolean
  enabled: boolean
  isInternal: boolean
  isRepresentativeBalance: boolean
  disabledReason?: string
}

/**
 * Carga la lista completa de activos disponibles desde el BFF.
 */
export function useAllAssets() {
  const [assets, setAssets] = useState<AssetOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/prices/all", { cache: "no-store" })
        if (!res.ok) throw new Error(`prices/all: ${res.status}`)
        const body = await res.json()
        const raw: UnifiedPrice[] = Array.isArray(body) ? body : (body.prices ?? [])
        if (!cancelled) {
          const mapped: AssetOption[] = raw.map((p) => {
            const code = p.assetCode.toUpperCase()
            const isInternal = p.metadata?.isInternal === true || p.metadata?.category === "INTERNAL"
            return {
              code,
              label: p.metadata?.name ?? code,
              name: p.metadata?.name ?? code,
              source: isInternal ? "internal" : p.source,
              iconUrl: p.metadata?.iconUrl,
              logoUrl: p.metadata?.logoUrl,
              category: p.metadata?.category,
              canBuy: p.metadata?.canBuy !== false,
              enabled: p.metadata?.enabled !== false,
              isInternal,
              isRepresentativeBalance: p.metadata?.isRepresentativeBalance === true,
            }
          })

          const hasBLC = mapped.some((a) => a.code === "BLC")
          if (!hasBLC) {
            mapped.push({
              code: "BLC",
              label: "BLC — Saldo interno deco-exchange",
              name: "deco-exchange Credit",
              source: "internal",
              category: "INTERNAL",
              canBuy: false,
              enabled: true,
              isInternal: true,
              isRepresentativeBalance: true,
              logoUrl: "/images/logos/stablecoin/blc-deco-exchange-credit-logo.svg",
              iconUrl: "/images/logos/stablecoin/blc-deco-exchange-credit-logo.svg",
            })
          }

          setAssets(mapped)
        }
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const cryptoAssets = assets
    .filter((a) => a.enabled)
    .filter((a) => a.source === "crypto" || a.source === "stablecoin" || a.source === "launchpad")
    .filter((a) => a.canBuy)
    .sort((a, b) => a.code.localeCompare(b.code))

  const fiatAssets = assets
    .filter((a) => a.enabled)
    .filter((a) => a.source === "fiat" || a.source === "internal" || a.isInternal)
    .sort((a, b) => {
      if (a.isInternal && !b.isInternal) return 1
      if (!a.isInternal && b.isInternal) return -1
      return a.code.localeCompare(b.code)
    })

  return { assets, cryptoAssets, fiatAssets, loading, error }
}
