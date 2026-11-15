"use client"

import { useCallback, useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { TransactionTable, Transaction } from "@/components/operaciones/transaction-table"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconBuildingBank,
  IconClock,
  IconCheck,
  IconWorld,
} from "@tabler/icons-react"

type RemittanceStatus =
  | "CREATED"
  | "CONFIRMED"
  | "SENT"
  | "RECEIVED"
  | "CANCELLED"
  | "FAILED"

type Remittance = {
  id: string
  senderUserId: string
  senderName?: string
  receiverName?: string
  receiverIdentifier: string
  amountdeco: number
  sourceCurrency: string
  targetCurrency: string
  targetAmount?: number
  status: RemittanceStatus
  createdAt: string
}

function normalizeResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const data = (payload as { data?: unknown }).data
  return Array.isArray(data) ? (data as T[]) : []
}

const statusLabel: Record<RemittanceStatus, string> = {
  CREATED: "Pendiente",
  CONFIRMED: "Procesando",
  SENT: "Procesando",
  RECEIVED: "Completado",
  CANCELLED: "Cancelado",
  FAILED: "Fallido",
}

export default function RemesasPage() {
  const [remittances, setRemittances] = useState<Transaction[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [countriesCount, setCountriesCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadRemittances = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch("/api/remittances/admin/all?limit=100", { cache: "no-store" })
      if (!res.ok) {
        throw new Error("No se pudo consultar remittances-core")
      }

      const payload = await res.json()
      const data = normalizeResponse<Remittance>(payload)
      const activeStatuses: RemittanceStatus[] = ["CREATED", "CONFIRMED", "SENT"]
      setActiveCount(data.filter((item) => activeStatuses.includes(item.status)).length)
      setCompletedCount(data.filter((item) => item.status === "RECEIVED").length)
      setCountriesCount(new Set(data.map((item) => item.targetCurrency)).size)
      setRemittances(data.map((item) => ({
        id: item.id,
        userName: item.senderName || item.senderUserId,
        recipientName: item.receiverName || item.receiverIdentifier,
        amount: `${new Intl.NumberFormat("es-CO", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.amountdeco)} ${item.sourceCurrency}`,
        country: item.targetCurrency,
        status: statusLabel[item.status] ?? item.status,
        createdAt: item.createdAt,
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error consultando remesas")
      setRemittances([])
      setActiveCount(0)
      setCompletedCount(0)
      setCountriesCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRemittances()
  }, [loadRemittances])

  const stats = [
    {
      title: "Remesas",
      value: loading ? "—" : remittances.length.toLocaleString("es-CO"),
      icon: <IconBuildingBank className="size-5" />,
      change: {
        value: 0,
        label: "remittances-core",
      },
    },
    {
      title: "Activas",
      value: loading ? "—" : activeCount.toLocaleString("es-CO"),
      icon: <IconCheck className="size-5" />,
      change: {
        value: 0,
        label: "en flujo",
      },
    },
    {
      title: "Completadas",
      value: loading ? "—" : completedCount.toLocaleString("es-CO"),
      icon: <IconClock className="size-5" />,
      change: {
        value: 0,
        label: "recibidas",
      },
    },
    {
      title: "Monedas destino",
      value: loading ? "—" : countriesCount.toLocaleString("es-CO"),
      icon: <IconWorld className="size-5" />,
      change: {
        value: 0,
        label: "detectadas",
      },
    },
  ]

  const filters = [
    {
      key: "status",
      label: "Estado",
      options: [
        { label: "Todos", value: "all" },
        { label: "Pendiente", value: "pending" },
        { label: "En Tránsito", value: "processing" },
        { label: "Completado", value: "completed" },
        { label: "Cancelado", value: "cancelled" },
      ],
    },
    {
      key: "country",
      label: "País Destino",
      options: [
        { label: "Todos", value: "all" },
        { label: "México", value: "MX" },
        { label: "Colombia", value: "CO" },
        { label: "Argentina", value: "AR" },
        { label: "Perú", value: "PE" },
        { label: "Chile", value: "CL" },
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
      label: "Remitente",
    },
    {
      key: "recipientName",
      label: "Beneficiario",
    },
    {
      key: "amount",
      label: "Monto",
      className: "text-right",
    },
    {
      key: "country",
      label: "País Destino",
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
        title="Remesas"
        description="Control de remesas internacionales registradas por remittances-core."
        state="partial"
        percent={55}
        note="Lista remesas globales por Gateway Admin; faltan acciones operativas avanzadas por rol."
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
        data={remittances}
        columns={columns}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  )
}
