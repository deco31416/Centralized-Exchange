"use client"

import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  formatP2PNumber,
  useP2PAdminOverview,
} from "@/components/operaciones/use-p2p-admin-overview"
import {
  IconAlertTriangle,
  IconCash,
  IconCoin,
  IconShoppingCart,
  IconStar,
} from "@tabler/icons-react"
import Link from "next/link"

export default function P2PPage() {
  const overview = useP2PAdminOverview()
  const stats = [
    {
      title: "Volumen total",
      value: overview.loading ? "-" : `${formatP2PNumber(overview.totalFiatVolume)} fiat`,
      icon: <IconCoin className="size-5" />,
      change: { value: 0, label: "Gateway admin", isPositive: true },
    },
    {
      title: "Órdenes P2P",
      value: overview.loading ? "-" : overview.orders.length,
      icon: <IconShoppingCart className="size-5" />,
      change: { value: 0, label: "P2P core", isPositive: true },
    },
    {
      title: "Completadas",
      value: overview.loading ? "-" : overview.completedOrders,
      icon: <IconCash className="size-5" />,
      change: { value: 0, label: "histórico", isPositive: true },
    },
    {
      title: "Disputas abiertas",
      value: overview.loading ? "-" : overview.openDisputes,
      icon: <IconAlertTriangle className="size-5" />,
      change: { value: 0, label: "riesgo", isPositive: true },
    },
  ]

  const modules = [
    {
      title: "Compras",
      description: "Órdenes de compra publicadas por usuarios.",
      href: "/operaciones/p2p/compras",
      icon: <IconShoppingCart className="size-6" />,
      stats: overview.loading ? "Consultando" : `${overview.orders.length} órdenes`,
      color: "from-blue-500/10 to-blue-500/5",
      state: "partial" as const,
      percent: 55,
    },
    {
      title: "Ventas",
      description: "Órdenes de venta publicadas por usuarios.",
      href: "/operaciones/p2p/ventas",
      icon: <IconCash className="size-6" />,
      stats: overview.loading ? "Consultando" : `${overview.orders.length} órdenes`,
      color: "from-emerald-500/10 to-emerald-500/5",
      state: "partial" as const,
      percent: 55,
    },
    {
      title: "Disputas",
      description: "Casos abiertos, revisión y resolución.",
      href: "/operaciones/p2p/disputas",
      icon: <IconAlertTriangle className="size-6" />,
      stats: overview.loading ? "Consultando" : `${overview.openDisputes} abiertas`,
      color: "from-rose-500/10 to-rose-500/5",
      state: "partial" as const,
      percent: 60,
    },
    {
      title: "Reputación",
      description: "Señales derivadas de órdenes y disputas.",
      href: "/operaciones/p2p/reputacion",
      icon: <IconStar className="size-6" />,
      stats: overview.loading ? "Consultando" : `${overview.uniqueUsers} usuarios`,
      color: "from-amber-500/10 to-amber-500/5",
      state: "partial" as const,
      percent: 35,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Mercado P2P"
        description="Gestión de órdenes, disputas y señales de reputación del mercado entre usuarios."
        state="partial"
        percent={55}
        note="micro-p2p-core ya lee órdenes y disputas por Gateway Admin; p2p-tunnel y reputación dedicada siguen pendientes."
      />

      {overview.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-300">
            {overview.error}
          </CardContent>
        </Card>
      ) : null}

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className={`bg-gradient-to-br ${module.color} cursor-pointer transition-all hover:shadow-md`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {module.icon}
                  </div>
                  <IconCoin className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CardTitle>{module.title}</CardTitle>
                  <ConnectionStatusBadge state={module.state} percent={module.percent} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{module.description}</p>
                <p className="text-sm font-semibold text-primary">{module.stats}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen operativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @xl/main:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Negociando</p>
              <p className="text-2xl font-bold">{overview.loading ? "-" : overview.activeOrders}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold">{overview.loading ? "-" : overview.completedOrders}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Canceladas</p>
              <p className="text-2xl font-bold">{overview.loading ? "-" : overview.cancelledOrders}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tasa de éxito</p>
              <p className="text-2xl font-bold">
                {overview.loading ? "-" : `${formatP2PNumber(overview.successRate, 1)}%`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
