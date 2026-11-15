"use client"

import { IconArrowsShuffle, IconCoin, IconCurrencyDollar, IconEye } from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { FiltersBar } from "@/components/operaciones/filters-bar"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable } from "@/components/operaciones/transaction-table"
import { Card } from "@/components/ui/card"
import { useAdminAssets } from "@/components/biblioteca/assets/use-admin-assets"

type AssetsListPageProps = {
  title: string
  description: string
  type?: "fiat" | "crypto" | "internal"
}

const columns = [
  { key: "id", label: "Código" },
  { key: "name", label: "Nombre" },
  { key: "type", label: "Tipo" },
  { key: "category", label: "Categoría" },
  { key: "operations", label: "Operaciones" },
  { key: "visible", label: "Frontend" },
  { key: "status", label: "Estado" },
]

const filters = [
  {
    key: "assetStatus",
    label: "Estado",
    options: [
      { value: "all", label: "Todos" },
      { value: "enabled", label: "Activos" },
      { value: "disabled", label: "Inactivos" },
    ],
  },
  {
    key: "assetType",
    label: "Tipo",
    options: [
      { value: "all", label: "Todos" },
      { value: "fiat", label: "Fiat" },
      { value: "crypto", label: "Cripto" },
    ],
  },
]

export function AssetsListPage({ title, description, type }: AssetsListPageProps) {
  const { assets, summary, loading, error } = useAdminAssets(type)

  const rows = assets.map((asset) => ({
    id: asset.code,
    name: asset.name,
    type: asset.type === "crypto" ? "Cripto" : asset.type === "fiat" ? "Fiat" : asset.type,
    category: asset.category,
    operations: [
      asset.canBuy ? "Compra" : null,
      asset.canSell ? "Venta" : null,
      asset.canConvert ? "Conversión" : null,
      asset.canSend ? "Envío" : null,
    ].filter(Boolean).join(" · ") || "—",
    visible: asset.isVisibleInFrontend ? "Visible" : "Oculto",
    status: asset.enabled ? "Activo" : "Inactivo",
  }))

  const stats = [
    {
      title: "Activos",
      value: loading ? "—" : summary.total.toLocaleString(),
      change: { value: 0, label: "catálogo" },
      icon: <IconCoin className="size-5" />,
    },
    {
      title: "Habilitados",
      value: loading ? "—" : summary.enabled.toLocaleString(),
      change: { value: 0, label: "enabled" },
      icon: <IconEye className="size-5" />,
    },
    {
      title: "Fiat / Cripto",
      value: loading ? "—" : `${summary.fiat} / ${summary.crypto}`,
      change: { value: 0, label: "tipo" },
      icon: <IconCurrencyDollar className="size-5" />,
    },
    {
      title: "Convertibles",
      value: loading ? "—" : summary.convertible.toLocaleString(),
      change: { value: 0, label: "canConvert" },
      icon: <IconArrowsShuffle className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={title}
        description={description}
        state={error ? "partial" : "connected"}
        percent={error ? 70 : 100}
        note="Lectura conectada a asset-registry por Gateway Admin."
      />

      {error ? (
        <Card className="rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          {error}. Revisa que Gateway Admin y asset-registry estén activos.
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
        emptyMessage="No hay activos para mostrar"
      />
    </div>
  )
}
