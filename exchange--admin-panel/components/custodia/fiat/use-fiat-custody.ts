"use client"

import { useEffect, useMemo, useState } from "react"

export type FiatProvider = {
  id: string
  name: string
  country: string
  currency: string
  rail: string
  status: "active" | "standby" | "maintenance"
  heldBalance: number
  pendingSettlement: number
  reserveBalance: number
  fee: {
    fixed: number
    percent: number
    currency: string
    settlementDays: string
  }
}

export type FiatReconciliationItem = {
  id: string
  provider: string
  currency: string
  expectedLedgerBalance: number
  providerBalance: number
  difference: number
  status: "matched" | "review" | "blocked"
  lastCheckedAt: string
}

type FiatCustodyOverview = {
  summary?: {
    providers?: number
    activeProviders?: number
    standbyProviders?: number
    heldBalance?: number
    pendingSettlement?: number
    reserveBalance?: number
    externalFeeProfiles?: number
  }
  providers?: FiatProvider[]
  reconciliation?: {
    data?: FiatReconciliationItem[]
  }
  feePolicy?: {
    note?: string
  }
}

type FiatCustodyState = {
  overview: FiatCustodyOverview | null
  loading: boolean
  error: string | null
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export function useFiatCustody() {
  const [state, setState] = useState<FiatCustodyState>({
    overview: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let mounted = true

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }))

      try {
        const overview = await readJson<FiatCustodyOverview>("/api/custody-fiat/overview")
        if (!mounted) return
        setState({ overview, loading: false, error: null })
      } catch {
        if (!mounted) return
        setState({
          overview: null,
          loading: false,
          error: "No se pudo consultar custodia fiat por Gateway Admin.",
        })
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    const providers = state.overview?.providers ?? []
    const reconciliation = state.overview?.reconciliation?.data ?? []
    const reviewItems = reconciliation.filter((item) => item.status !== "matched").length

    return {
      providers: state.overview?.summary?.providers ?? providers.length,
      activeProviders: state.overview?.summary?.activeProviders ?? 0,
      pendingSettlement: state.overview?.summary?.pendingSettlement ?? 0,
      reserveBalance: state.overview?.summary?.reserveBalance ?? 0,
      externalFeeProfiles: state.overview?.summary?.externalFeeProfiles ?? providers.length,
      reviewItems,
    }
  }, [state.overview])

  return {
    ...state,
    providers: state.overview?.providers ?? [],
    reconciliation: state.overview?.reconciliation?.data ?? [],
    feePolicy: state.overview?.feePolicy ?? null,
    summary,
  }
}
