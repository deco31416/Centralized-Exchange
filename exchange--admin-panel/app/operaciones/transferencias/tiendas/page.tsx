"use client"

import { useCallback, useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { TransactionTable, Transaction } from "@/components/operaciones/transaction-table"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconBuildingStore,
  IconCheck,
  IconClock,
  IconChartBar,
} from "@tabler/icons-react"

type DecopayStatus = "PENDING" | "PAID" | "CANCELLED"

type DecopayRequest = {
  requestId: string
  payerUserId: string
  collectorUserId: string
  amount: number
  currency: string
  concept?: string
  title?: string
  description?: string
  payerEmail?: string
  collectorEmail?: string
  status: DecopayStatus
  createdAt?: string
  paidAt?: string | null
}

function normalizeResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const data = (payload as { data?: unknown }).data
  return Array.isArray(data) ? (data as T[]) : []
}

const statusLabel: Record<DecopayStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Completado",
  CANCELLED: "Cancelado",
}

export default function TransferenciasTiendasPage() {
  const [payments, setPayments] = useState<Transaction[]>([])
  const [paidCount, setPaidCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [storeCount, setStoreCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStorePayments = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch("/api/decopay/requests", { cache: "no-store" })
      if (!res.ok) {
        throw new Error("No se pudo consultar decopay-core")
      }

      const payload = await res.json()
      const data = normalizeResponse<DecopayRequest>(payload)
      setPaidCount(data.filter((item) => item.status === "PAID").length)
      setPendingCount(data.filter((item) => item.status === "PENDING").length)
      setStoreCount(new Set(data.map((item) => item.collectorUserId)).size)
      setPayments(data.map((item) => ({
        id: item.requestId,
        userName: item.payerEmail || item.payerUserId,
        storeName: item.collectorEmail || item.collectorUserId,
        amount: `${new Intl.NumberFormat("es-CO", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.amount)} ${item.currency}`,
        category: item.title || item.concept || "DECOPAY",
        status: statusLabel[item.status] ?? item.status,
        createdAt: item.createdAt || item.paidAt || "",
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error consultando pagos a tiendas")
      setPayments([])
      setPaidCount(0)
      setPendingCount(0)
      setStoreCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStorePayments()
  }, [loadStorePayments])

  const stats = [
    {
      title: "Total a Tiendas",
      value: loading ? "—" : payments.length.toLocaleString("es-CO"),
      icon: <IconBuildingStore className="size-5" />,
      change: {
        value: 0,
        label: "DECOPAY",
      },
    },
    {
      title: "Transacciones",
      value: loading ? "—" : paidCount.toLocaleString("es-CO"),
      icon: <IconCheck className="size-5" />,
      change: {
        value: 0,
        label: "pagadas",
      },
    },
    {
      title: "Tiendas Activas",
      value: loading ? "—" : storeCount.toLocaleString("es-CO"),
      icon: <IconChartBar className="size-5" />,
      change: {
        value: 0,
        label: "collectors",
      },
    },
    {
      title: "Pendientes",
      value: loading ? "—" : pendingCount.toLocaleString("es-CO"),
      icon: <IconClock className="size-5" />,
      change: {
        value: 0,
        label: "por pagar",
        isPositive: true,
      },
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
      key: "category",
      label: "Categoría",
      options: [
        { label: "Todas", value: "all" },
        { label: "Comida", value: "food" },
        { label: "Retail", value: "retail" },
        { label: "Servicios", value: "services" },
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
      label: "Usuario",
    },
    {
      key: "storeName",
      label: "Tienda",
    },
    {
      key: "amount",
      label: "Monto",
      className: "text-right",
    },
    {
      key: "category",
      label: "Categoría",
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
        title="Transferencias a tiendas"
        description="Pagos de usuarios a comercios y tiendas asociados al flujo DECOPAY."
        state="partial"
        percent={65}
        note="Lee solicitudes reales de DECOPAY por Gateway Admin; falta clasificación comercial y conciliación por tienda."
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
        data={payments}
        columns={columns}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  )
}
