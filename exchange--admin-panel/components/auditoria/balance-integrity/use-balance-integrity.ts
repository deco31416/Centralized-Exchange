"use client"

import { useEffect, useMemo, useState } from "react"

type BalanceAuditStatus = "solvent" | "warning" | "insolvent"

type BalanceAuditControl = {
  id: string
  name: string
  status: BalanceAuditStatus
  description: string
}

type BalanceAuditOverview = {
  summary?: {
    status?: BalanceAuditStatus
    assets?: number
    liabilities?: number
    ratio?: number
    difference?: number
    openAlerts?: number
  }
  latest?: {
    status?: BalanceAuditStatus
    assets?: number
    liabilities?: number
    ratio?: number
    difference?: number
    checkedAt?: string
    source?: string
  }
  controls?: BalanceAuditControl[]
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export function useBalanceIntegrity() {
  const [overview, setOverview] = useState<BalanceAuditOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await readJson<BalanceAuditOverview>("/api/audit-balance-integrity/overview")
        if (!mounted) return
        setOverview(data)
      } catch {
        if (!mounted) return
        setError("No se pudo consultar integridad de balances por Gateway Admin.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    const data = overview?.summary

    return {
      status: data?.status ?? "warning",
      assets: data?.assets ?? 0,
      liabilities: data?.liabilities ?? 0,
      ratio: data?.ratio ?? 0,
      difference: data?.difference ?? 0,
      openAlerts: data?.openAlerts ?? 0,
    }
  }, [overview])

  return {
    overview,
    controls: overview?.controls ?? [],
    latest: overview?.latest ?? null,
    summary,
    loading,
    error,
  }
}
