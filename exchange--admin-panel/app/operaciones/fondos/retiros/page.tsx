"use client"

import { useCallback, useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { TransactionTable, Transaction } from "@/components/operaciones/transaction-table"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { Button } from "@/components/ui/button"
import {
  IconArrowUpRight,
  IconClock,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react"

type WithdrawalStatus =
  | "REQUESTED"
  | "RISK_PENDING"
  | "RISK_REJECTED"
  | "SECURITY_HOLD"
  | "RESERVED"
  | "BROADCASTED"
  | "CONFIRMED"
  | "FAILED"

type Withdrawal = {
  withdrawalId: string
  userId: string
  assetSymbol: string
  network: string
  destinationAddress: string
  amountMinorUnits: string
  status: WithdrawalStatus
  txHash?: string
  errorReason?: string
  createdAt?: string
  updatedAt?: string
}

function normalizeResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const data = (payload as { data?: unknown }).data
  return Array.isArray(data) ? (data as T[]) : []
}

const statusLabel: Record<WithdrawalStatus, string> = {
  REQUESTED: "Pendiente",
  RISK_PENDING: "Procesando",
  RISK_REJECTED: "Rechazado",
  SECURITY_HOLD: "En Auditoría",
  RESERVED: "Procesando",
  BROADCASTED: "Procesando",
  CONFIRMED: "Completado",
  FAILED: "Fallido",
}

export default function RetirosPage() {
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([])
  const [requestedCount, setRequestedCount] = useState(0)
  const [reservedCount, setReservedCount] = useState(0)
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadWithdrawals = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch("/api/withdrawals/admin?limit=100", { cache: "no-store" })
      if (!res.ok) {
        throw new Error("No se pudo consultar withdrawal-orchestrator")
      }

      const payload = await res.json()
      const data = normalizeResponse<Withdrawal>(payload)
      setRequestedCount(data.filter((item) => item.status === "REQUESTED").length)
      setReservedCount(data.filter((item) => item.status === "RESERVED").length)
      setConfirmedCount(data.filter((item) => item.status === "CONFIRMED").length)
      setWithdrawals(data.map((item) => ({
        id: item.withdrawalId,
        userName: item.userId,
        amount: `${item.amountMinorUnits} ${item.assetSymbol}`,
        method: item.network,
        destination: item.destinationAddress,
        status: statusLabel[item.status] ?? item.status,
        rawStatus: item.status,
        errorReason: item.errorReason || "—",
        createdAt: item.createdAt || item.updatedAt || "",
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error consultando retiros")
      setWithdrawals([])
      setRequestedCount(0)
      setReservedCount(0)
      setConfirmedCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWithdrawals()
  }, [loadWithdrawals])

  async function processPending() {
    try {
      setProcessing(true)
      setError(null)
      const res = await fetch("/api/withdrawals/admin/process-pending", {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("No se pudo procesar la cola de retiros")
      }
      await loadWithdrawals()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error procesando retiros")
    } finally {
      setProcessing(false)
    }
  }

  const stats = [
    {
      title: "Retiros",
      value: loading ? "—" : withdrawals.length.toLocaleString("es-CO"),
      icon: <IconArrowUpRight className="size-5" />,
      change: { value: 0, label: "orchestrator" },
    },
    {
      title: "Solicitados",
      value: loading ? "—" : requestedCount.toLocaleString("es-CO"),
      icon: <IconClock className="size-5" />,
      change: { value: 0, label: "pendientes" },
    },
    {
      title: "Reservados",
      value: loading ? "—" : reservedCount.toLocaleString("es-CO"),
      icon: <IconAlertTriangle className="size-5" />,
      change: { value: 0, label: "en proceso" },
    },
    {
      title: "Confirmados",
      value: loading ? "—" : confirmedCount.toLocaleString("es-CO"),
      icon: <IconCheck className="size-5" />,
      change: { value: 0, label: "liquidados" },
    },
  ]

  const filters = [
    {
      key: "status",
      label: "Estado",
      options: [
        { label: "Todos", value: "all" },
        { label: "Pendiente", value: "pending" },
        { label: "Procesando", value: "processing" },
        { label: "Completado", value: "completed" },
        { label: "Fallido", value: "failed" },
      ],
    },
    {
      key: "method",
      label: "Método",
      options: [
        { label: "Todos", value: "all" },
        { label: "Transferencia", value: "bank_transfer" },
        { label: "Cripto", value: "crypto" },
        { label: "Wallet", value: "wallet" },
      ],
    },
  ]

  const columns = [
    {
      key: "id",
      label: "ID",
      className: "font-mono text-xs",
      render: (value: string) => value.slice(0, 12),
    },
    {
      key: "userName",
      label: "Usuario",
    },
    {
      key: "amount",
      label: "Monto",
      className: "text-right",
    },
    {
      key: "method",
      label: "Método",
      render: (value: string) => {
        const methodLabels: Record<string, string> = {
          bank_transfer: "Transferencia",
          crypto: "Cripto",
          wallet: "Wallet",
        }
        return methodLabels[value] || value
      },
    },
    {
      key: "destination",
      label: "Destino",
      className: "font-mono text-xs max-w-[200px] truncate",
    },
    {
      key: "status",
      label: "Estado",
    },
    {
      key: "createdAt",
      label: "Fecha",
    },
    {
      key: "errorReason",
      label: "Nota",
      className: "max-w-[220px] truncate",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Retiros"
        description="Seguimiento de retiros fiat y cripto gestionados por withdrawal-orchestrator."
        state="partial"
        percent={60}
        note="Lee retiros reales por Gateway Admin y permite ejecutar el procesamiento de pendientes."
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
        onExport={processPending}
      />

      <div className="flex justify-end">
        <Button onClick={processPending} disabled={processing}>
          {processing ? "Procesando..." : "Procesar pendientes"}
        </Button>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        data={withdrawals}
        columns={columns}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  )
}
