"use client"

import { useCallback, useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { TransactionTable, Transaction } from "@/components/operaciones/transaction-table"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { Button } from "@/components/ui/button"
import {
  IconArrowDownLeft,
  IconClock,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react"

type BlcDepositRequestStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_MORE_INFO"

type BlcDepositMethod = {
  methodId: string
  name: string
  country: string
  fiatCode: string
  enabled: boolean
  type: string
}

type BlcDepositRequest = {
  requestId: string
  userId: string
  amount: number
  currency: "BLC"
  selectedPaymentMethodId: string
  reference: string
  status: BlcDepositRequestStatus
  userNote?: string
  adminNote?: string
  createdAt: string
}

function formatAmount(amount: number, currency: string) {
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`
}

function normalizeFundingResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const data = (payload as { data?: unknown }).data
  return Array.isArray(data) ? (data as T[]) : []
}

const statusLabel: Record<BlcDepositRequestStatus, string> = {
  PENDING_REVIEW: "Pendiente",
  APPROVED: "Completado",
  REJECTED: "Rechazado",
  NEEDS_MORE_INFO: "Procesando",
}

export default function DepositosPage() {
  const [deposits, setDeposits] = useState<Transaction[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [needsInfoCount, setNeedsInfoCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDeposits = useCallback(async () => {
    try {
      setError(null)
      const [requestsRes, methodsRes] = await Promise.all([
        fetch("/api/funding/admin/blc/deposit-requests", { cache: "no-store" }),
        fetch("/api/funding/admin/blc/deposit-methods", { cache: "no-store" }),
      ])

      if (!requestsRes.ok) {
        throw new Error("No se pudo consultar funding-core")
      }

      const requestsPayload = await requestsRes.json()
      const methodsPayload = methodsRes.ok ? await methodsRes.json() : { data: [] }
      const requests = normalizeFundingResponse<BlcDepositRequest>(requestsPayload)
      const methods = normalizeFundingResponse<BlcDepositMethod>(methodsPayload)
      const methodsById = new Map(methods.map((method) => [method.methodId, method]))

      setPendingCount(requests.filter((item) => item.status === "PENDING_REVIEW").length)
      setApprovedCount(requests.filter((item) => item.status === "APPROVED").length)
      setNeedsInfoCount(requests.filter((item) => item.status === "NEEDS_MORE_INFO").length)
      setDeposits(requests.map((request) => {
        const method = methodsById.get(request.selectedPaymentMethodId)
        return {
          id: request.requestId,
          userName: request.userId,
          amount: formatAmount(request.amount, request.currency),
          method: method
            ? `${method.name} · ${method.country}/${method.fiatCode}`
            : request.selectedPaymentMethodId,
          status: statusLabel[request.status] ?? request.status,
          rawStatus: request.status,
          reference: request.reference,
          createdAt: request.createdAt,
        }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error consultando depósitos")
      setDeposits([])
      setPendingCount(0)
      setApprovedCount(0)
      setNeedsInfoCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDeposits()
  }, [loadDeposits])

  async function updateRequestStatus(
    requestId: string,
    action: "approve" | "reject" | "needs-more-info",
  ) {
    const adminNote = window.prompt("Nota operativa para esta acción") || undefined
    try {
      setActionId(requestId)
      setError(null)
      const res = await fetch(`/api/funding/admin/blc/deposit-requests/${requestId}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminNote }),
      })

      if (!res.ok) {
        throw new Error("No se pudo actualizar la solicitud BLC")
      }

      await loadDeposits()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error actualizando solicitud")
    } finally {
      setActionId(null)
    }
  }

  const stats = [
    {
      title: "Solicitudes BLC",
      value: loading ? "—" : deposits.length.toLocaleString("es-CO"),
      icon: <IconArrowDownLeft className="size-5" />,
      change: { value: 0, label: "funding-core" },
    },
    {
      title: "Pendientes",
      value: loading ? "—" : pendingCount.toLocaleString("es-CO"),
      icon: <IconClock className="size-5" />,
      change: { value: 0, label: "por revisar" },
    },
    {
      title: "Aprobados",
      value: loading ? "—" : approvedCount.toLocaleString("es-CO"),
      icon: <IconCheck className="size-5" />,
      change: { value: 0, label: "acreditados" },
    },
    {
      title: "Requieren acción",
      value: loading ? "—" : needsInfoCount.toLocaleString("es-CO"),
      icon: error ? <IconX className="size-5" /> : <IconAlertCircle className="size-5" />,
      change: { value: 0, label: error ? "sin conexión" : "más información" },
    },
  ]

  const filters = [
    {
      key: "status",
      label: "Estado",
      options: [
        { label: "Todos", value: "all" },
        { label: "Pendiente", value: "pending" },
        { label: "Completado", value: "completed" },
        { label: "Rechazado", value: "rejected" },
      ],
    },
    {
      key: "method",
      label: "Método",
      options: [
        { label: "Todos", value: "all" },
        { label: "Transferencia", value: "bank_transfer" },
        { label: "Pago móvil", value: "mobile_payment" },
        { label: "ACH", value: "ach" },
      ],
    },
  ]

  const columns = [
    {
      key: "id",
      label: "ID",
      className: "font-mono text-xs",
      render: (value: string) => value.replace("blc_req_", "").slice(0, 12),
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
          card: "Tarjeta",
          crypto: "Cripto",
        }
        return methodLabels[value] || value
      },
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
      key: "reference",
      label: "Referencia",
      className: "font-mono text-xs",
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_value: unknown, row: Transaction) => {
        const disabled = actionId === row.id || row.rawStatus === "APPROVED" || row.rawStatus === "REJECTED"
        return (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation()
                updateRequestStatus(row.id, "needs-more-info")
              }}
            >
              Pedir info
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation()
                updateRequestStatus(row.id, "reject")
              }}
            >
              Rechazar
            </Button>
            <Button
              size="sm"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation()
                updateRequestStatus(row.id, "approve")
              }}
            >
              Aprobar
            </Button>
          </div>
        )
      },
      className: "text-right",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Depósitos"
        description="Revisión de solicitudes BLC creadas por usuarios y conciliadas desde funding-core."
        state="partial"
        percent={85}
        note="Lee solicitudes y métodos BLC por Gateway Admin; permite aprobar, rechazar o pedir más información."
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
        data={deposits}
        columns={columns}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  )
}
