"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { TransactionTable, Transaction } from "@/components/operaciones/transaction-table"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconUsers,
  IconCheck,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react"

export default function TransferenciasUsuariosPage() {
  const [transfers, setTransfers] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/wallet/admin/transactions?limit=100&type=P2P_TRANSFER')
        if (!res.ok) return
        const data = await res.json()
        setTotal(data.total)
        setTransfers(data.transactions.map((tx: any) => ({
          id: tx.txId.substring(0, 8),
          userName: tx.accountId.substring(0, 12),
          recipientName: tx.externalRef?.toAccountId?.substring(0, 12) || '—',
          amount: tx.amountFormatted,
          concept: tx.concept || '—',
          status: 'Completado',
          createdAt: new Date(tx.createdAt).toLocaleString('es-MX'),
        })))
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    {
      title: "Total transferencias",
      value: loading ? '—' : total.toLocaleString(),
      icon: <IconUsers className="size-5" />,
      change: { value: 0, label: "en ledger" },
    },
    {
      title: "Cargadas",
      value: loading ? '—' : transfers.length.toString(),
      icon: <IconCheck className="size-5" />,
      change: { value: 0, label: "en esta página" },
    },
    {
      title: "Tipo",
      value: "P2P",
      icon: <IconTrendingUp className="size-5" />,
      change: { value: 0, label: "filtro" },
    },
    {
      title: "Estado",
      value: loading ? 'Cargando...' : 'Conectado',
      icon: <IconClock className="size-5" />,
      change: { value: 0, label: "API real" },
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
      key: "amount",
      label: "Monto",
      options: [
        { label: "Todos", value: "all" },
        { label: "< $10", value: "low" },
        { label: "$10 - $100", value: "medium" },
        { label: "> $100", value: "high" },
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
      label: "Destinatario",
    },
    {
      key: "amount",
      label: "Monto",
      className: "text-right",
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
        title="Transferencias entre usuarios"
        description="Movimientos P2P entre cuentas internas de la plataforma."
        state="partial"
        percent={65}
        note="Consulta P2P_TRANSFER por Gateway Admin; filtros, exportación y acciones siguen como interfaz."
      />

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
