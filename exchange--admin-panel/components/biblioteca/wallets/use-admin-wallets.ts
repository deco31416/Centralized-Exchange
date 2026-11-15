"use client"

import { useEffect, useMemo, useState } from "react"

export type AdminWallet = {
  walletId: string
  accountId: string
  currency: string
  availableFormatted: string
  lockedFormatted: string
  status: string
  createdAt: string
}

type AdminWalletsResponse = {
  wallets: AdminWallet[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function isFiatCurrency(currency: string) {
  return ["USD", "MXN", "COP", "EUR", "BRL", "ARS", "CLP", "PEN", "VES", "AWG", "DOP", "CAD"].includes(currency)
}

export function useAdminWallets(limit = 100) {
  const [wallets, setWallets] = useState<AdminWallet[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/wallet/admin/wallets?limit=${limit}`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("No se pudo consultar wallet-ledger")
        }

        const data: AdminWalletsResponse = await response.json()
        setWallets(data.wallets || [])
        setTotal(Number(data.total || 0))
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error desconocido")
          setWallets([])
          setTotal(0)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [limit])

  const summary = useMemo(() => {
    const active = wallets.filter((wallet) => wallet.status === "ACTIVE").length
    const frozen = wallets.filter((wallet) => wallet.status === "FROZEN").length
    const fiat = wallets.filter((wallet) => isFiatCurrency(wallet.currency)).length
    const crypto = wallets.length - fiat

    return {
      total,
      loaded: wallets.length,
      active,
      frozen,
      fiat,
      crypto,
    }
  }, [total, wallets])

  return { wallets, total, summary, loading, error }
}
