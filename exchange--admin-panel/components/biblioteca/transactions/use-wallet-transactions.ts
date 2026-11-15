"use client"

import { useEffect, useMemo, useState } from "react"
import type { Transaction } from "@/components/operaciones/transaction-table"

export type AdminLedgerTransaction = {
  txId: string
  type: string
  accountId: string
  currency: string
  amountMinorUnits: string
  amountFormatted: string
  balanceAfterFormatted: string
  correlationId: string
  concept?: string
  externalRef?: Record<string, unknown>
  createdAt: string
}

type AdminLedgerResponse = {
  transactions: AdminLedgerTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function labelType(type: string) {
  if (type === "P2P_TRANSFER") return "Transferencia"
  if (type === "FIAT_DEPOSIT_CONFIRMED") return "Depósito fiat"
  if (type === "ADJUSTMENT") return "Ajuste"
  return type.replaceAll("_", " ")
}

function mapTransaction(tx: AdminLedgerTransaction): Transaction {
  return {
    id: tx.txId.substring(0, 8),
    txHash: tx.correlationId.substring(0, 12),
    type: labelType(tx.type),
    rawType: tx.type,
    user: tx.accountId.substring(0, 12),
    amount: tx.amountFormatted,
    asset: tx.currency,
    timestamp: new Date(tx.createdAt).toLocaleString("es-MX"),
    status: "Completada",
  }
}

export function useWalletTransactions(limit = 100) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/wallet/admin/transactions?limit=${limit}`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("No se pudo consultar wallet-ledger")
        }

        const data: AdminLedgerResponse = await response.json()
        setTotal(Number(data.total || 0))
        setTransactions((data.transactions || []).map(mapTransaction))
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error desconocido")
          setTransactions([])
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
    const countByType = (type: string) =>
      transactions.filter((transaction) => transaction.rawType === type).length

    return {
      total,
      loaded: transactions.length,
      adjustments: countByType("ADJUSTMENT"),
      fiatDeposits: countByType("FIAT_DEPOSIT_CONFIRMED"),
      p2pTransfers: countByType("P2P_TRANSFER"),
    }
  }, [total, transactions])

  return { transactions, total, summary, loading, error }
}
