"use client"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable } from "@/components/operaciones/transaction-table"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/operaciones/status-badge"
import type { TransactionStatus } from "@/components/operaciones/status-badge"
import {
  useP2PAdminOverview,
  type P2PDispute,
} from "@/components/operaciones/use-p2p-admin-overview"
import {
  formatP2PStatus,
  mapP2PDisputeStatus,
  shortId,
} from "@/components/operaciones/p2p-formatters"
import { IconAlertTriangle, IconCheck, IconClock, IconX } from "@tabler/icons-react"

type DisputeRow = {
  id: string
  orderId: string
  openedByUserId: string
  reason: string
  status: TransactionStatus
  statusLabel: string
  resolvedByAdminId: string
  resolvedAt?: string
  createdAt?: string
}

function toDisputeRow(dispute: P2PDispute): DisputeRow {
  return {
    id: dispute.disputeId,
    orderId: shortId(dispute.orderId),
    openedByUserId: shortId(dispute.openedByUserId),
    reason: dispute.reason,
    status: mapP2PDisputeStatus(dispute.status),
    statusLabel: formatP2PStatus(dispute.status),
    resolvedByAdminId: shortId(dispute.resolvedByAdminId),
    resolvedAt: dispute.resolvedAt,
    createdAt: dispute.createdAt,
  }
}

export default function P2PDisputasPage() {
  const overview = useP2PAdminOverview()
  const resolved = overview.disputes.filter((dispute) =>
    ["RESOLVED", "CLOSED"].includes(dispute.status),
  ).length
  const rejected = overview.disputes.filter((dispute) => dispute.status === "REJECTED").length
  const resolutionBase = resolved + rejected
  const resolutionRate = resolutionBase > 0 ? Math.round((resolved / resolutionBase) * 100) : 0

  const stats = [
    {
      title: "Disputas abiertas",
      value: overview.loading ? "-" : overview.openDisputes,
      icon: <IconAlertTriangle className="size-5" />,
      change: { value: 0, label: "P2P core", isPositive: true },
    },
    {
      title: "Total disputas",
      value: overview.loading ? "-" : overview.disputes.length,
      icon: <IconClock className="size-5" />,
      change: { value: 0, label: "Gateway admin", isPositive: true },
    },
    {
      title: "Resueltas",
      value: overview.loading ? "-" : resolved,
      icon: <IconCheck className="size-5" />,
      change: { value: 0, label: "histórico", isPositive: true },
    },
    {
      title: "Tasa resolución",
      value: overview.loading ? "-" : `${resolutionRate}%`,
      icon: <IconX className="size-5" />,
      change: { value: 0, label: "resueltas/rechazadas", isPositive: true },
    },
  ]

  const columns = [
    { key: "id", label: "ID", className: "font-mono text-xs", render: (value: string) => shortId(value) },
    { key: "orderId", label: "Orden", className: "font-mono text-xs" },
    { key: "openedByUserId", label: "Reportado por", className: "font-mono text-xs" },
    { key: "reason", label: "Motivo" },
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
    { key: "resolvedByAdminId", label: "Admin", className: "font-mono text-xs" },
    { key: "resolvedAt", label: "Resolución" },
    { key: "createdAt", label: "Fecha" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Disputas P2P"
        description="Casos abiertos y resueltos del mercado P2P desde micro-p2p-core."
        state="partial"
        percent={60}
        note="La lectura de disputas ya pasa por Gateway Admin; faltan acciones de resolución y evidencia del túnel P2P."
      />

      {overview.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-300">
            {overview.error}
          </CardContent>
        </Card>
      ) : null}

      <StatsCards stats={stats} />
      <TransactionTable data={overview.disputes.map(toDisputeRow)} columns={columns as any} />
    </div>
  )
}
