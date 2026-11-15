"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { TransactionTable, Transaction } from "@/components/operaciones/transaction-table"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconBuildingBank, IconTrendingUp, IconUser, IconCoins } from "@tabler/icons-react"

interface AdminWallet {
  walletId: string
  accountId: string
  currency: string
  availableFormatted: string
  lockedFormatted: string
  status: string
  createdAt: string
}

interface AdminWalletsResponse {
  wallets: AdminWallet[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function FinancialBalancesPage() {
  const [wallets, setWallets] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [frozenCount, setFrozenCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/wallet/admin/wallets?limit=100')
        if (!res.ok) return
        const data: AdminWalletsResponse = await res.json()
        setTotal(data.total)
        const active = data.wallets.filter(w => w.status === 'ACTIVE').length
        const frozen = data.wallets.filter(w => w.status === 'FROZEN').length
        setActiveCount(active)
        setFrozenCount(frozen)
        setWallets(data.wallets.map(w => ({
          id: w.walletId.substring(0, 8),
          userName: w.accountId.substring(0, 12),
          email: '—',
          totalBalance: w.availableFormatted,
          fiatBalance: w.currency === 'MXN' || w.currency === 'USD' ? w.availableFormatted : '—',
          cryptoBalance: w.currency !== 'MXN' && w.currency !== 'USD' ? w.availableFormatted : '—',
          lastActivity: new Date(w.createdAt).toLocaleDateString('es-MX'),
          status: w.status === 'ACTIVE' ? 'Activo' : w.status === 'FROZEN' ? 'Congelada' : w.status,
        })))
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    {
      title: "Total wallets",
      value: loading ? '—' : total.toLocaleString(),
      change: { value: 0, label: "en ledger" },
      icon: <IconBuildingBank className="size-5" />,
    },
    {
      title: "Wallets activas",
      value: loading ? '—' : activeCount.toLocaleString(),
      change: { value: 0, label: "status ACTIVE" },
      icon: <IconUser className="size-5" />,
    },
    {
      title: "Wallets congeladas",
      value: loading ? '—' : frozenCount.toLocaleString(),
      change: { value: 0, label: "status FROZEN" },
      icon: <IconTrendingUp className="size-5" />,
    },
    {
      title: "Cargadas",
      value: loading ? '—' : wallets.length.toString(),
      change: { value: 0, label: "en esta página" },
      icon: <IconCoins className="size-5" />,
    },
  ]

  const filters = [
    {
      key: "balanceRange",
      label: "Rango de balance",
      options: [
        { value: "all", label: "Todos" },
        { value: "high", label: "> $100K" },
        { value: "medium", label: "$10K - $100K" },
        { value: "low", label: "$1K - $10K" },
        { value: "minimal", label: "< $1K" },
      ]
    },
    {
      key: "accountStatus",
      label: "Estado de cuenta",
      options: [
        { value: "all", label: "Todas" },
        { value: "active", label: "Activas" },
        { value: "dormant", label: "Inactivas" },
        { value: "frozen", label: "Congeladas" },
      ]
    }
  ]

  const columns = [
    { key: "id", label: "ID" },
    { key: "userName", label: "Usuario" },
    { key: "email", label: "Email" },
    { key: "totalBalance", label: "Balance total" },
    { key: "fiatBalance", label: "Balance Fiat" },
    { key: "cryptoBalance", label: "Balance Crypto" },
    { key: "lastActivity", label: "Última actividad" },
    { key: "status", label: "Estado" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Balances generales"
        description="Vista consolidada de wallets, saldos disponibles y estados de cuenta."
        state="partial"
        percent={65}
        note="Consulta /api/wallet/admin/wallets por Gateway Admin; filtros, exportación y agrupación por usuario quedan pendientes."
      />

      <StatsCards stats={stats} />
      <FiltersBar
        onSearch={(query) => console.log("Search:", query)}
        filters={filters}
        onFilterChange={(key, value) => console.log("Filter changed:", key, value)}
        onExport={() => console.log("Export")}
      />
      <TransactionTable columns={columns} data={wallets} />
    </div>
  )
}
