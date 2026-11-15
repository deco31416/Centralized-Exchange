"use client"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable } from "@/components/operaciones/transaction-table"
import type { TransactionStatus } from "@/components/operaciones/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/operaciones/status-badge"
import {
  formatP2PNumber,
  useP2PAdminOverview,
  type P2POrder,
} from "@/components/operaciones/use-p2p-admin-overview"
import { formatP2PStatus, mapP2POrderStatus, shortId } from "./p2p-formatters"
import { IconCash, IconCoin, IconClock, IconUsers } from "@tabler/icons-react"

type OrderRow = {
  id: string
  buyerId: string
  sellerId: string
  asset: string
  cryptoAmount: string
  fiatAmount: string
  price: string
  payment: string
  status: TransactionStatus
  statusLabel: string
  createdAt?: string
}

function toOrderRow(order: P2POrder): OrderRow {
  return {
    id: order.orderId,
    buyerId: shortId(order.buyerId),
    sellerId: shortId(order.sellerId),
    asset: order.assetCode,
    cryptoAmount: `${formatP2PNumber(Number(order.cryptoAmount) || 0, 6)} ${order.assetCode}`,
    fiatAmount: `${formatP2PNumber(Number(order.fiatAmount) || 0)} ${order.fiatCode}`,
    price: `${formatP2PNumber(Number(order.price) || 0)} ${order.fiatCode}`,
    payment: order.paymentStatus || order.paymentRail || order.paymentMethodId || "-",
    status: mapP2POrderStatus(order.status),
    statusLabel: formatP2PStatus(order.status),
    createdAt: order.createdAt,
  }
}

export function P2POrdersPage({ mode }: { mode: "compras" | "ventas" }) {
  const overview = useP2PAdminOverview()
  const title = mode === "compras" ? "Compras P2P" : "Ventas P2P"
  const actorLabel = mode === "compras" ? "Compradores" : "Vendedores"

  const stats = [
    {
      title: "Volumen total",
      value: overview.loading ? "-" : `${formatP2PNumber(overview.totalFiatVolume)} fiat`,
      icon: <IconCoin className="size-5" />,
      change: { value: 0, label: "Gateway admin", isPositive: true },
    },
    {
      title: "Órdenes",
      value: overview.loading ? "-" : overview.orders.length,
      icon: <IconCash className="size-5" />,
      change: { value: 0, label: "P2P core", isPositive: true },
    },
    {
      title: actorLabel,
      value: overview.loading ? "-" : overview.uniqueUsers,
      icon: <IconUsers className="size-5" />,
      change: { value: 0, label: "usuarios únicos", isPositive: true },
    },
    {
      title: "Pendientes",
      value: overview.loading ? "-" : overview.activeOrders,
      icon: <IconClock className="size-5" />,
      change: { value: 0, label: "en proceso", isPositive: true },
    },
  ]

  const columns = [
    { key: "id", label: "ID", className: "font-mono text-xs", render: (value: string) => shortId(value) },
    { key: "buyerId", label: "Comprador", className: "font-mono text-xs" },
    { key: "sellerId", label: "Vendedor", className: "font-mono text-xs" },
    { key: "asset", label: "Activo", className: "font-mono" },
    { key: "cryptoAmount", label: "Cripto", className: "text-right tabular-nums" },
    { key: "fiatAmount", label: "Fiat", className: "text-right tabular-nums" },
    { key: "price", label: "Precio", className: "text-right tabular-nums" },
    { key: "payment", label: "Pago" },
    {
      key: "status",
      label: "Estado",
      render: (value: TransactionStatus, row: { statusLabel?: string }) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={value} />
          <span className="text-xs text-muted-foreground">{row.statusLabel}</span>
        </div>
      ),
    },
    { key: "createdAt", label: "Fecha" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={title}
        description="Órdenes reales del mercado P2P consultadas desde micro-p2p-core."
        state="partial"
        percent={55}
        note="La lectura de órdenes ya pasa por Gateway Admin; faltan acciones operativas completas, reputación dedicada y túnel P2P."
      />

      {overview.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-300">
            {overview.error}
          </CardContent>
        </Card>
      ) : null}

      <StatsCards stats={stats} />

      <TransactionTable data={overview.orders.map(toOrderRow)} columns={columns as any} />
    </div>
  )
}
