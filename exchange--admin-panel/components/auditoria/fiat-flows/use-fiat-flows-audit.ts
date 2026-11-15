"use client"

import { useEffect, useMemo, useState } from "react"

export type FiatFlowStatus = "matched" | "review" | "blocked"

export type FiatFlowAuditItem = {
  id: string
  provider: string
  rail: string
  currency: string
  type: "deposit" | "withdrawal" | "remittance" | "merchant_payment"
  expectedAmount: number
  providerAmount: number
  difference: number
  status: FiatFlowStatus
  lastCheckedAt: string
  note: string
}

type FiatFlowAlert = {
  id: string
  severity: "low" | "medium" | "high"
  title: string
  description: string
  createdAt: string
}

type FiatFlowControl = {
  id: string
  name: string
  status: FiatFlowStatus
  description: string
}

type FiatFlowOverview = {
  summary?: {
    status?: FiatFlowStatus
    flows?: number
    matched?: number
    review?: number
    blocked?: number
    totalDifference?: number
    providers?: number
    lastCheckedAt?: string
  }
  alerts?: FiatFlowAlert[]
  reconciliation?: {
    data?: FiatFlowAuditItem[]
  }
  controls?: FiatFlowControl[]
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export function useFiatFlowsAudit() {
  const [overview, setOverview] = useState<FiatFlowOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await readJson<FiatFlowOverview>("/api/audit-fiat-flows/overview")
        if (!mounted) return
        setOverview(data)
      } catch {
        if (!mounted) return
        setOverview(null)
        setError("No se pudo consultar flujos fiat por Gateway Admin.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const reconciliation = overview?.reconciliation?.data ?? []

  const summary = useMemo(() => {
    const review = reconciliation.filter((item) => item.status === "review").length
    const blocked = reconciliation.filter((item) => item.status === "blocked").length
    const matched = reconciliation.filter((item) => item.status === "matched").length

    return {
      status: overview?.summary?.status ?? (blocked ? "blocked" : review ? "review" : "matched"),
      flows: overview?.summary?.flows ?? reconciliation.length,
      matched: overview?.summary?.matched ?? matched,
      review: overview?.summary?.review ?? review,
      blocked: overview?.summary?.blocked ?? blocked,
      providers: overview?.summary?.providers ?? 0,
      totalDifference:
        overview?.summary?.totalDifference ??
        reconciliation.reduce((sum, item) => sum + Math.abs(item.difference), 0),
      lastCheckedAt: overview?.summary?.lastCheckedAt,
    }
  }, [overview, reconciliation])

  return {
    overview,
    summary,
    alerts: overview?.alerts ?? [],
    controls: overview?.controls ?? [],
    reconciliation,
    loading,
    error,
  }
}
