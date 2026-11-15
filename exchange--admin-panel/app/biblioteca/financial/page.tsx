"use client"

import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconBuildingBank, IconWallet, IconCoin, IconChartBar, IconClockDollar, IconReceipt } from "@tabler/icons-react"
import Link from "next/link"

export default function FinancialProfilePage() {
  const overviewStats = [
    {
      title: "Balance total",
      value: "Parcial",
      change: { value: 0, label: "wallet-ledger" },
      icon: <IconBuildingBank className="size-5" />,
    },
    {
      title: "Balance fiat",
      value: "Parcial",
      change: { value: 0, label: "wallet-ledger" },
      icon: <IconWallet className="size-5" />,
    },
    {
      title: "Balance cripto",
      value: "Parcial",
      change: { value: 0, label: "wallet-ledger" },
      icon: <IconCoin className="size-5" />,
    },
    {
      title: "Límites activos",
      value: "Pendiente",
      change: { value: 0, label: "risk" },
      icon: <IconChartBar className="size-5" />,
    },
  ]

  const modules = [
    {
      title: "Balances generales",
      href: "/biblioteca/financial/balances",
      icon: <IconBuildingBank className="size-5" />,
      gradient: "from-emerald-500 to-green-600",
      count: "Conexión inicial",
      state: "partial" as const,
      percent: 65,
    },
    {
      title: "Balances Fiat",
      href: "/biblioteca/financial/fiat",
      icon: <IconWallet className="size-5" />,
      gradient: "from-blue-500 to-cyan-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 20,
    },
    {
      title: "Balances Crypto",
      href: "/biblioteca/financial/crypto",
      icon: <IconCoin className="size-5" />,
      gradient: "from-amber-500 to-orange-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 20,
    },
    {
      title: "Límites y cuotas",
      href: "/biblioteca/financial/limites",
      icon: <IconChartBar className="size-5" />,
      gradient: "from-purple-500 to-indigo-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 15,
    },
    {
      title: "Historial financiero",
      href: "/biblioteca/financial/historial",
      icon: <IconClockDollar className="size-5" />,
      gradient: "from-teal-500 to-cyan-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 20,
    },
    {
      title: "Datos fiscales",
      href: "/biblioteca/financial/fiscales",
      icon: <IconReceipt className="size-5" />,
      gradient: "from-red-500 to-pink-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 15,
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Perfil financiero"
        description="Gestión de balances, límites, historial financiero y datos fiscales."
        state="partial"
        percent={35}
        note="Balances generales consulta wallet-ledger por Gateway Admin; límites, historial y fiscal quedan pendientes."
      />

      <StatsCards stats={overviewStats} />

      <div className="grid grid-cols-1 gap-4 @xl/page:grid-cols-2 @4xl/page:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
              <div className={`h-2 bg-gradient-to-r ${module.gradient}`} />
              <div className="flex items-start gap-4 p-6">
                <div className={`rounded-lg bg-gradient-to-br ${module.gradient} p-3 text-white shadow-lg`}>
                  {module.icon}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    <ConnectionStatusBadge state={module.state} percent={module.percent} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 tabular-nums">{module.count}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-2 p-6">
        <h3 className="mb-4 font-semibold text-foreground">Resumen financiero</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Volumen transaccional hoy</span>
            <span className="font-medium tabular-nums text-foreground">—</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Depósitos pendientes</span>
            <span className="font-medium tabular-nums text-foreground">—</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Retiros pendientes</span>
            <span className="font-medium tabular-nums text-foreground">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Usuarios cerca del límite</span>
            <span className="font-medium tabular-nums text-foreground">—</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
