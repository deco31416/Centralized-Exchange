"use client"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable } from "@/components/operaciones/transaction-table"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatP2PNumber,
  useP2PAdminOverview,
} from "@/components/operaciones/use-p2p-admin-overview"
import { shortId } from "@/components/operaciones/p2p-formatters"
import { IconChartLine, IconShieldCheck, IconStar, IconUsers } from "@tabler/icons-react"
import { useMemo } from "react"

type UserReputationRow = {
  id: string
  userId: string
  buyOrders: number
  sellOrders: number
  completed: number
  active: number
  cancelled: number
  completionRate: string
}

export default function P2PReputacionPage() {
  const overview = useP2PAdminOverview()

  const rows = useMemo(() => {
    const activeStatuses = new Set(["CREATED", "PAYMENT_PENDING", "PAYMENT_MARKED", "RELEASE_PENDING", "DISPUTED"])
    const completedStatuses = new Set(["RELEASED", "COMPLETED"])
    const cancelledStatuses = new Set(["CANCELLED", "EXPIRED"])
    const byUser = new Map<string, Omit<UserReputationRow, "completionRate">>()

    function ensure(userId: string) {
      if (!byUser.has(userId)) {
        byUser.set(userId, {
          id: userId,
          userId: shortId(userId),
          buyOrders: 0,
          sellOrders: 0,
          completed: 0,
          active: 0,
          cancelled: 0,
        })
      }
      return byUser.get(userId)!
    }

    for (const order of overview.orders) {
      const buyer = ensure(order.buyerId)
      const seller = ensure(order.sellerId)
      buyer.buyOrders += 1
      seller.sellOrders += 1

      for (const row of [buyer, seller]) {
        if (completedStatuses.has(order.status)) row.completed += 1
        if (activeStatuses.has(order.status)) row.active += 1
        if (cancelledStatuses.has(order.status)) row.cancelled += 1
      }
    }

    return Array.from(byUser.values()).map((row) => {
      const base = row.completed + row.cancelled
      return {
        ...row,
        completionRate: base > 0 ? `${formatP2PNumber((row.completed / base) * 100, 1)}%` : "Sin historial",
      }
    })
  }, [overview.orders])

  const stats = [
    {
      title: "Usuarios P2P",
      value: overview.loading ? "-" : overview.uniqueUsers,
      icon: <IconUsers className="size-5" />,
      change: { value: 0, label: "derivado", isPositive: true },
    },
    {
      title: "Éxito operativo",
      value: overview.loading ? "-" : `${formatP2PNumber(overview.successRate, 1)}%`,
      icon: <IconStar className="size-5" />,
      change: { value: 0, label: "órdenes", isPositive: true },
    },
    {
      title: "Completadas",
      value: overview.loading ? "-" : overview.completedOrders,
      icon: <IconShieldCheck className="size-5" />,
      change: { value: 0, label: "P2P core", isPositive: true },
    },
    {
      title: "Disputas abiertas",
      value: overview.loading ? "-" : overview.openDisputes,
      icon: <IconChartLine className="size-5" />,
      change: { value: 0, label: "riesgo", isPositive: true },
    },
  ]

  const columns = [
    { key: "userId", label: "Usuario", className: "font-mono text-xs" },
    { key: "buyOrders", label: "Compras", className: "text-right tabular-nums" },
    { key: "sellOrders", label: "Ventas", className: "text-right tabular-nums" },
    { key: "completed", label: "Completadas", className: "text-right tabular-nums" },
    { key: "active", label: "Activas", className: "text-right tabular-nums" },
    { key: "cancelled", label: "Canceladas", className: "text-right tabular-nums" },
    { key: "completionRate", label: "Tasa éxito", className: "text-right tabular-nums" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Reputación P2P"
        description="Métricas derivadas de órdenes reales mientras se crea el servicio dedicado de reputación."
        state="partial"
        percent={35}
        note="La reputación dedicada todavía no existe; esta vista usa órdenes y disputas reales como señal operativa inicial."
      />

      {overview.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-300">
            {overview.error}
          </CardContent>
        </Card>
      ) : null}

      <StatsCards stats={stats} />
      <TransactionTable data={rows} columns={columns} />
    </div>
  )
}
