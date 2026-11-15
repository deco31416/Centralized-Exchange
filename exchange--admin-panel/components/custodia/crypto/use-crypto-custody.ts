"use client"

import { useEffect, useMemo, useState } from "react"

export type CustodyWallet = {
  _id?: string
  assetCode?: string
  blockchain?: string
  mainAddress?: string
  balance?: number
  maxWithdrawalPerTx?: number
  maxWithdrawalPerHour?: number
  maxWithdrawalPerDay?: number
  minOperationalBalance?: number
  alertThresholdPercentage?: number
  requiresMultiSig?: boolean
  isLocked?: boolean
  isActive?: boolean
  lastBalanceCheck?: string
}

export type CryptoDeposit = {
  _id?: string
  assetCode?: string
  blockchain?: string
  amount?: number
  status?: string
  txHash?: string
  createdAt?: string
}

type WatchtowerStatus = {
  isRunning?: boolean
  lastScanAt?: string
  scannedBlocks?: Record<string, number>
  [key: string]: unknown
}

type CryptoCustodyState = {
  wallets: CustodyWallet[]
  deposits: CryptoDeposit[]
  pendingWithdrawals: unknown[]
  watchtower: WatchtowerStatus | null
  loading: boolean
  error: string | null
}

const initialState: CryptoCustodyState = {
  wallets: [],
  deposits: [],
  pendingWithdrawals: [],
  watchtower: null,
  loading: true,
  error: null,
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: T[] }).data
  }
  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: T[] }).items
  }
  return []
}

export function useCryptoCustody() {
  const [state, setState] = useState<CryptoCustodyState>(initialState)

  useEffect(() => {
    let mounted = true

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }))

      const [walletsResult, depositsResult, withdrawalsResult, watchtowerResult] =
        await Promise.allSettled([
          readJson<unknown>("/api/custody-crypto/admin/custody/balances"),
          readJson<unknown>("/api/custody-crypto/admin/deposits?limit=10"),
          readJson<unknown>("/api/custody-crypto/admin/withdrawals/pending"),
          readJson<WatchtowerStatus>("/api/custody-crypto/admin/watchtower/status"),
        ])

      if (!mounted) return

      const failed = [walletsResult, depositsResult, withdrawalsResult, watchtowerResult].filter(
        (result) => result.status === "rejected",
      )

      setState({
        wallets: walletsResult.status === "fulfilled" ? asArray<CustodyWallet>(walletsResult.value) : [],
        deposits: depositsResult.status === "fulfilled" ? asArray<CryptoDeposit>(depositsResult.value) : [],
        pendingWithdrawals:
          withdrawalsResult.status === "fulfilled" ? asArray<unknown>(withdrawalsResult.value) : [],
        watchtower: watchtowerResult.status === "fulfilled" ? watchtowerResult.value : null,
        loading: false,
        error: failed.length ? "Algunos endpoints de custodia crypto no respondieron por Gateway Admin." : null,
      })
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    const activeWallets = state.wallets.filter((wallet) => wallet.isActive !== false).length
    const lockedWallets = state.wallets.filter((wallet) => wallet.isLocked).length
    const assets = new Set(state.wallets.map((wallet) => wallet.assetCode).filter(Boolean))
    const totalBalance = state.wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0)

    return {
      activeWallets,
      lockedWallets,
      assets: assets.size,
      totalBalance,
      deposits: state.deposits.length,
      pendingWithdrawals: state.pendingWithdrawals.length,
      watchtowerRunning: Boolean(state.watchtower?.isRunning),
    }
  }, [state])

  return { ...state, summary }
}
