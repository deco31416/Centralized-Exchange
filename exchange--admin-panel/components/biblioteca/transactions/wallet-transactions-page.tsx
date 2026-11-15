"use client"

import { IconActivity, IconCoin, IconCurrencyDollar, IconReceipt } from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable } from "@/components/operaciones/transaction-table"
import { Card } from "@/components/ui/card"
import { useWalletTransactions } from "@/components/biblioteca/transactions/use-wallet-transactions"

type WalletTransactionsPageProps = {
  title: string
  description: string
  mode?: "all" | "completed"
}

const columns = [
  { key: "id", label: "ID" },
  { key: "txHash", label: "Referencia" },
  { key: "type", label: "Tipo" },
  { key: "user", label: "Usuario" },
  { key: "amount", label: "Monto" },
  { key: "asset", label: "Activo" },
  { key: "timestamp", label: "Fecha/Hora" },
  { key: "status", label: "Estado" },
]

const filters = [
  {
    key: "txType",
    label: "Tipo",
    options: [
      { value: "all", label: "Todas" },
      { value: "deposit", label: "Depósito" },
      { value: "adjustment", label: "Ajuste" },
      { value: "transfer", label: "Transferencia" },
    ],
  },
  {
    key: "assetType",
    label: "Activo",
    options: [
      { value: "all", label: "Todos" },
      { value: "crypto", label: "Cripto" },
      { value: "fiat", label: "Fiat" },
    ],
  },
]

export function WalletTransactionsPage({
  title,
  description,
  mode = "all",
}: WalletTransactionsPageProps) {
  const { transactions, summary, loading, error } = useWalletTransactions()
  const rows = mode === "completed" ? transactions : transactions

  const stats = [
    {
      title: "Total transacciones",
      value: loading ? "—" : summary.total.toLocaleString(),
      change: { value: 0, label: "ledger" },
      icon: <IconReceipt className="size-5" />,
    },
    {
      title: "En esta página",
      value: loading ? "—" : rows.length.toString(),
      change: { value: 0, label: "cargadas" },
      icon: <IconCoin className="size-5" />,
    },
    {
      title: "Fuente",
      value: "Ledger",
      change: { value: 0, label: "wallet-ledger" },
      icon: <IconCurrencyDollar className="size-5" />,
    },
    {
      title: "Estado",
      value: error ? "Parcial" : loading ? "Cargando..." : "Conectado",
      change: { value: 0, label: "Gateway Admin" },
      icon: <IconActivity className="size-5" />,
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
        emptyMessage="No hay movimientos de ledger para mostrar"
      />
    </div>
  )
}
