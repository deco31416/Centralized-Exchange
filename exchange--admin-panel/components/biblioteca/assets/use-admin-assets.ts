"use client"

import { useEffect, useMemo, useState } from "react"
import type { CatalogAsset } from "@/lib/api/catalogApi"

export function useAdminAssets(type?: "fiat" | "crypto" | "internal") {
  const [assets, setAssets] = useState<CatalogAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const params = type ? `?type=${type}` : ""
        const response = await fetch(`/api/catalog/admin/assets${params}`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("No se pudo consultar asset-registry")
        }

        const data = await response.json()
        setAssets(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error desconocido")
          setAssets([])
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [type])

  const summary = useMemo(() => {
    const enabled = assets.filter((asset) => asset.enabled).length
    const visible = assets.filter((asset) => asset.enabled && asset.isVisibleInFrontend).length
    const fiat = assets.filter((asset) => asset.type === "fiat").length
    const crypto = assets.filter((asset) => asset.type === "crypto").length
    const convertible = assets.filter((asset) => asset.canConvert).length

    return {
      total: assets.length,
      enabled,
      visible,
      fiat,
      crypto,
      convertible,
    }
  }, [assets])

  return { assets, summary, loading, error }
}
