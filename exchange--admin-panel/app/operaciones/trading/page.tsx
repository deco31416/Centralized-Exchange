import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconTrendingUp,
  IconChartCandle,
  IconScale,
  IconUsers,
  IconRobot,
  IconChartLine,
} from "@tabler/icons-react"
import Link from "next/link"

export default function TradingPage() {
  const stats = [
    {
      title: "Volumen 24h",
      value: "Pendiente",
      icon: <IconChartCandle className="size-5" />,
      change: {
        value: 0,
        label: "gateway",
      },
    },
    {
      title: "Total operaciones",
      value: "Pendiente",
      icon: <IconTrendingUp className="size-5" />,
      change: {
        value: 0,
        label: "gateway",
      },
    },
    {
      title: "Traders activos",
      value: "Pendiente",
      icon: <IconUsers className="size-5" />,
      change: {
        value: 0,
        label: "gateway",
      },
    },
    {
      title: "Promedio por operación",
      value: "Pendiente",
      icon: <IconChartLine className="size-5" />,
      change: {
        value: 0,
        label: "engine",
      },
    },
  ]

  const modules = [
    {
      title: "Spot",
      description: "Operaciones al contado de activos digitales.",
      href: "/operaciones/trading/spot",
      icon: <IconChartCandle className="size-6" />,
      stats: "Vista local",
      color: "from-emerald-500/10 to-emerald-500/5",
      state: "pending" as const,
      percent: 10,
    },
    {
      title: "Futuros",
      description: "Contratos de futuros y derivados.",
      href: "/operaciones/trading/futuros",
      icon: <IconTrendingUp className="size-6" />,
      stats: "I+D+i",
      color: "from-blue-500/10 to-blue-500/5",
      badge: "I+D+i",
      state: "pending" as const,
      percent: 5,
    },
    {
      title: "OTC",
      description: "Operaciones over-the-counter.",
      href: "/operaciones/trading/otc",
      icon: <IconScale className="size-6" />,
      stats: "I+D+i",
      color: "from-purple-500/10 to-purple-500/5",
      badge: "I+D+i",
      state: "pending" as const,
      percent: 5,
    },
    {
      title: "Copy Trading",
      description: "Copia de estrategias de traders expertos.",
      href: "/operaciones/trading/copy-trading",
      icon: <IconUsers className="size-6" />,
      stats: "I+D+i",
      color: "from-orange-500/10 to-orange-500/5",
      badge: "I+D+i",
      state: "pending" as const,
      percent: 5,
    },
    {
      title: "Bots",
      description: "Trading automatizado con bots.",
      href: "/operaciones/trading/bots",
      icon: <IconRobot className="size-6" />,
      stats: "I+D+i",
      color: "from-rose-500/10 to-rose-500/5",
      badge: "I+D+i",
      state: "pending" as const,
      percent: 5,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Trading"
        description="Gestión operativa de spot, futuros, OTC, copy trading y bots."
        state="pending"
        percent={10}
        note="Las vistas actuales usan datos locales; falta conectar trading engine, órdenes, libros y ejecución por Gateway Admin."
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className={`bg-gradient-to-br ${module.color} cursor-pointer transition-all hover:shadow-md relative`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {module.icon}
                  </div>
                  {module.badge && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-400 font-medium">
                      ⚠️ {module.badge}
                    </span>
                  )}
                  {!module.badge && <IconChartLine className="size-5 text-muted-foreground" />}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CardTitle>{module.title}</CardTitle>
                  <ConnectionStatusBadge state={module.state} percent={module.percent} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
                <p className="text-sm font-semibold text-primary">
                  {module.stats}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen operativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @xl/main:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Órdenes abiertas</p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ejecutadas hoy</p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Canceladas</p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fallidas</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
