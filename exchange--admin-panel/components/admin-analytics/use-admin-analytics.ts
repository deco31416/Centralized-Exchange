"use client"

import { useEffect, useState } from "react"

export type AdminAnalyticsOverview = {
  generatedAt: string
  range: "7d" | "30d" | "90d"
  dataCompleteness: number
  source: "empty" | "aggregated"
  sources?: {
    key: string
    label: string
    status: "connected" | "unavailable"
    detail?: string
    checkedAt: string
  }[]
  totals: {
    users: number
    operations: number
    volumeUsd: number
    revenueUsd: number
    riskCases: number
  }
}

export type AnalyticsConnectionState = "connected_empty" | "connected" | "pending"

type AdminAnalyticsState = {
  overview: AdminAnalyticsOverview | null
  loading: boolean
  error: string | null
  state: AnalyticsConnectionState
}

export function useAdminAnalytics(range = "30d"): AdminAnalyticsState {
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/admin-analytics/overview?range=${range}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Admin analytics respondió ${response.status}`)
        }

        const data = (await response.json()) as AdminAnalyticsOverview
        if (!cancelled) setOverview(data)
      } catch (err) {
        if (!cancelled) {
          setOverview(null)
          setError(err instanceof Error ? err.message : "No se pudo conectar Admin Analytics")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [range])

  const state: AnalyticsConnectionState = error
    ? "pending"
    : overview?.source === "empty"
      ? "connected_empty"
      : "connected"

  return { overview, loading, error, state }
}
