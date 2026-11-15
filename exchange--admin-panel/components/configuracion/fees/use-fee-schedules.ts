"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { FeeSchedule } from "./types"
import { getFeeScheduleId } from "./types"

function normalizeSchedules(payload: unknown): FeeSchedule[] {
  if (Array.isArray(payload)) return payload as FeeSchedule[]

  if (payload && typeof payload === "object") {
    const source = payload as {
      data?: unknown
      items?: unknown
      schedules?: unknown
      feeSchedules?: unknown
    }

    const value =
      source.items ?? source.schedules ?? source.feeSchedules ?? source.data

    if (Array.isArray(value)) return value as FeeSchedule[]
  }

  return []
}

async function readJson(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("La respuesta del gateway no es JSON válido.")
  }
}

export function useFeeSchedules() {
  const [schedules, setSchedules] = useState<FeeSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin-pricing/fee-schedules", {
        cache: "no-store",
      })
      const payload = await readJson(response)

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message?: unknown }).message)
            : "No se pudieron cargar las reglas de fees."
        throw new Error(message)
      }

      setSchedules(normalizeSchedules(payload))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error desconocido.")
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setEnabled = useCallback(
    async (schedule: FeeSchedule, enabled: boolean) => {
      const id = getFeeScheduleId(schedule)
      if (!id) return

      setUpdatingId(id)
      setError(null)

      try {
        const response = await fetch(
          `/api/admin-pricing/fee-schedules/${id}/${enabled ? "enable" : "disable"}`,
          {
            method: "POST",
            cache: "no-store",
          },
        )
        const payload = await readJson(response)

        if (!response.ok) {
          const message =
            payload && typeof payload === "object" && "message" in payload
              ? String((payload as { message?: unknown }).message)
              : "No se pudo actualizar la regla."
          throw new Error(message)
        }

        await load()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Error desconocido.")
      } finally {
        setUpdatingId(null)
      }
    },
    [load],
  )

  const summary = useMemo(() => {
    const active = schedules.filter((schedule) => schedule.enabled).length
    const byPair = schedules.filter((schedule) => schedule.scope === "PAIR").length
    const global = schedules.filter((schedule) => schedule.scope === "GLOBAL").length
    const percentage = schedules.filter((schedule) => schedule.feeType === "PERCENTAGE").length

    return {
      total: schedules.length,
      active,
      byPair,
      global,
      percentage,
    }
  }, [schedules])

  return {
    schedules,
    loading,
    error,
    updatingId,
    summary,
    reload: load,
    setEnabled,
  }
}
