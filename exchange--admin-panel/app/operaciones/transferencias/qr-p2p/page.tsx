"use client"

import { useCallback, useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { TransactionTable, Transaction } from "@/components/operaciones/transaction-table"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconQrcode,
  IconCheck,
  IconClock,
  IconScan,
} from "@tabler/icons-react"

type P2PCodeStatus = "PENDING" | "USED" | "EXPIRED" | "CANCELLED"

type P2PCode = {
  code: string
  fromUserId: string
  currency: string
  amountMinorUnits: string
  status: P2PCodeStatus
  expiresAt: string
  concept?: string
  usedBy?: string
  ledgerTxId?: string
  transferType?: string
  createdAt?: string
}

function normalizeResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const data = (payload as { data?: unknown }).data
  return Array.isArray(data) ? (data as T[]) : []
}

const statusLabel: Record<P2PCodeStatus, string> = {
  PENDING: "Pendiente",
  USED: "Completado",
  EXPIRED: "Fallido",
  CANCELLED: "Cancelado",
}

export default function TransferenciasQrP2PPage() {
  const [transfers, setTransfers] = useState<Transaction[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [usedCount, setUsedCount] = useState(0)
  const [closedCount, setClosedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCodes = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch("/api/p2p/admin/codes?limit=100", { cache: "no-store" })
      if (!res.ok) {
        throw new Error("No se pudo consultar internal-transfers")
      }

      const payload = await res.json()
      const codes = normalizeResponse<P2PCode>(payload)
      setPendingCount(codes.filter((code) => code.status === "PENDING").length)
      setUsedCount(codes.filter((code) => code.status === "USED").length)
      setClosedCount(codes.filter((code) => code.status === "EXPIRED" || code.status === "CANCELLED").length)
      setTransfers(codes.map((code) => ({
        id: code.code,
        userName: code.fromUserId,
        recipientName: code.usedBy || "—",
        amount: `${code.amountMinorUnits} ${code.currency}`,
        qrCode: code.code,
        type: code.transferType || "P2P_QR",
        concept: code.concept || "—",
        status: statusLabel[code.status] ?? code.status,
        createdAt: code.createdAt || code.expiresAt,
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error consultando QR P2P")
      setTransfers([])
      setPendingCount(0)
      setUsedCount(0)
      setClosedCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCodes()
  }, [loadCodes])

  const stats = [
    {
      title: "Códigos QR/P2P",
      value: loading ? "—" : transfers.length.toLocaleString("es-CO"),
      icon: <IconQrcode className="size-5" />,
      change: { value: 0, label: "internal-transfers" },
    },
    {
      title: "Pendientes",
      value: loading ? "—" : pendingCount.toLocaleString("es-CO"),
      icon: <IconScan className="size-5" />,
      change: { value: 0, label: "activos" },
    },
    {
      title: "Usados",
      value: loading ? "—" : usedCount.toLocaleString("es-CO"),
      icon: <IconCheck className="size-5" />,
      change: { value: 0, label: "pagados" },
    },
    {
      title: "Cerrados",
      value: loading ? "—" : closedCount.toLocaleString("es-CO"),
      icon: <IconClock className="size-5" />,
      change: { value: 0, label: "expirados/cancelados" },
    },
  ]

  const filters = [
    {
      key: "status",
      label: "Estado",
      options: [
        { label: "Todos", value: "all" },
        { label: "Completado", value: "completed" },
        { label: "Pendiente", value: "pending" },
        { label: "Fallido", value: "failed" },
      ],
    },
    {
      key: "type",
      label: "Tipo",
      options: [
        { label: "Todos", value: "all" },
        { label: "QR Estático", value: "static" },
        { label: "QR Dinámico", value: "dynamic" },
      ],
    },
  ]

  const columns = [
    {
      key: "id",
      label: "ID",
      className: "font-mono text-xs",
    },
    {
      key: "userName",
      label: "Pagador",
    },
    {
      key: "recipientName",
      label: "Usado por",
    },
    {
      key: "amount",
      label: "Monto",
      className: "text-right",
    },
    {
      key: "qrCode",
      label: "Código QR",
      className: "font-mono text-xs",
    },
    {
      key: "type",
      label: "Tipo",
    },
    {
      key: "concept",
      label: "Concepto",
      className: "max-w-[200px] truncate",
    },
    {
      key: "status",
      label: "Estado",
    },
    {
      key: "createdAt",
      label: "Fecha",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Transferencias QR P2P"
        description="Lectura de operaciones P2P asociadas a pagos o referencias QR."
        state="partial"
        percent={70}
        note="Lee códigos QR/P2P desde internal-transfers por Gateway Admin; ejecución final sigue en wallet-ledger."
      />

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filters Bar */}
      <FiltersBar
        onSearch={(query) => console.log("Search:", query)}
        filters={filters}
        onFilterChange={(key, value) =>
          console.log("Filter changed:", key, value)
        }
        onExport={() => console.log("Export")}
      />

      {/* Transaction Table */}
      <TransactionTable
        data={transfers}
        columns={columns}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  )
}
