"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { PriceBand, SpreadSource } from "./types"

function normalizeBands(payload: unknown, source: SpreadSource): PriceBand[] {
  const value =
    Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object"
        ? ((payload as { data?: unknown; items?: unknown; bands?: unknown }).items ??
          (payload as { data?: unknown; items?: unknown; bands?: unknown }).bands ??
          (payload as { data?: unknown; items?: unknown; bands?: unknown }).data)
        : []

  if (!Array.isArray(value)) return []
  return value.map((band) => ({ ...(band as PriceBand), source }))
}

async function readJson(response: Response) {
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export function usePriceBands() {
  const [bands, setBands] = useState<PriceBand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [fiatResponse, cryptoResponse] = await Promise.all([
        fetch("/api/admin-pricing/price-bands/fiat", { cache: "no-store" }),
        fetch("/api/admin-pricing/price-bands/crypto", { cache: "no-store" }),
      ])

      const [fiatPayload, cryptoPayload] = await Promise.all([
        readJson(fiatResponse),
        readJson(cryptoResponse),
      ])

      if (!fiatResponse.ok || !cryptoResponse.ok) {
        throw new Error("No se pudieron cargar todas las bandas de spread.")
      }

      setBands([
        ...normalizeBands(fiatPayload, "fiat"),
        ...normalizeBands(cryptoPayload, "crypto"),
      ])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error desconocido.")
      setBands([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => {
    const active = bands.filter((band) => band.enabled).length
    const manual = bands.filter((band) => band.mode === "MANUAL").length
    const alerts = bands.filter((band) => band.alertLevel !== "SAFE").length
    const fiat = bands.filter((band) => band.source === "fiat").length
    const crypto = bands.filter((band) => band.source === "crypto").length

    return { total: bands.length, active, manual, alerts, fiat, crypto }
  }, [bands])

  return { bands, loading, error, summary, reload: load }
}
