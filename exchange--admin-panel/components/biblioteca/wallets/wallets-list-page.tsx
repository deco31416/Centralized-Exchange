"use client"

import { IconCoin, IconDatabase, IconWallet } from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable } from "@/components/operaciones/transaction-table"
import { Card } from "@/components/ui/card"
import { isFiatCurrency, useAdminWallets } from "@/components/biblioteca/wallets/use-admin-wallets"

type WalletsListPageProps = {
  title: string
  description: string
  mode?: "all" | "fiat" | "crypto"
}

const columns = [
  { key: "id", label: "Wallet" },
  { key: "userName", label: "Cuenta" },
  { key: "asset", label: "Moneda" },
  { key: "available", label: "Disponible" },
  { key: "locked", label: "Bloqueado" },
  { key: "lastActivity", label: "Creada" },
  { key: "status", label: "Estado" },
]

const filters = [
  {
    key: "walletStatus",
    label: "Estado",
    options: [
      { value: "all", label: "Todas" },
      { value: "active", label: "Activas" },
      { value: "frozen", label: "Congeladas" },
    ],
  },
  {
    key: "walletType",
    label: "Tipo",
    options: [
      { value: "all", label: "Todos" },
      { value: "fiat", label: "Fiat" },
      { value: "crypto", label: "Cripto" },
    ],
  },
]

export function WalletsListPage({ title, description, mode = "all" }: WalletsListPageProps) {
  const { wallets, summary, loading, error } = useAdminWallets()

  const filteredWallets = wallets.filter((wallet) => {
    if (mode === "fiat") return isFiatCurrency(wallet.currency)
    if (mode === "crypto") return !isFiatCurrency(wallet.currency)
    return true
  })

  const rows = filteredWallets.map((wallet) => ({
    id: wallet.walletId.substring(0, 8),
    userName: wallet.accountId.substring(0, 12),
    asset: wallet.currency,
    available: wallet.availableFormatted,
    locked: wallet.lockedFormatted,
    lastActivity: new Date(wallet.createdAt).toLocaleDateString("es-MX"),
    status: wallet.status === "ACTIVE" ? "Activa" : wallet.status === "FROZEN" ? "Congelada" : wallet.status,
  }))

  const stats = [
    {
      title: "Wallets",
      value: loading ? "—" : filteredWallets.length.toLocaleString(),
      change: { value: 0, label: "cargadas" },
      icon: <IconWallet className="size-5" />,
    },
    {
      title: "Fiat",
      value: loading ? "—" : summary.fiat.toLocaleString(),
      change: { value: 0, label: "monedas fiat" },
      icon: <IconDatabase className="size-5" />,
    },
    {
      title: "Cripto",
      value: loading ? "—" : summary.crypto.toLocaleString(),
      change: { value: 0, label: "criptoactivos" },
      icon: <IconCoin className="size-5" />,
    },
    {
      title: "Activas",
      value: loading ? "—" : summary.active.toLocaleString(),
      change: { value: 0, label: "status ACTIVE" },
      icon: <IconWallet className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={title}
        description={description}
        state={error ? "partial" : "connected"}
        percent={error ? 65 : 100}
        note="Lectura conectada a wallet-ledger por Gateway Admin."
      />

      {error ? (
        <Card className="rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          {error}. Revisa que Gateway Admin y wallet-ledger estén activos.
        </Card>
      ) : null}

      <StatsCards stats={stats} />
      <FiltersBar
        onSearch={() => undefined}
        filters={filters}
        onFilterChange={() => undefined}
        onExport={() => undefined}
      />
      <TransactionTable
        columns={columns}
        data={rows}
        emptyMessage="No hay wallets para mostrar"
      />
    </div>
  )
}
