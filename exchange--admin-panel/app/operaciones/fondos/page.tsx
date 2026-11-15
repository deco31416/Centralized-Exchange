"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconCashBanknote,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconBuildingBank,
  IconChartLine,
} from "@tabler/icons-react"
import Link from "next/link"

type BlcDepositRequestStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_MORE_INFO"

type BlcDepositRequest = {
  requestId: string
  status: BlcDepositRequestStatus
}

type FundingOverview = {
  totalDeposits: number
  pendingDeposits: number
  approvedDeposits: number
  needsInfoDeposits: number
  connected: boolean
}

function normalizeFundingResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const data = (payload as { data?: unknown }).data
  return Array.isArray(data) ? (data as T[]) : []
}

export default function FondosPage() {
  const [overview, setOverview] = useState<FundingOverview>({
    totalDeposits: 0,
    pendingDeposits: 0,
    approvedDeposits: 0,
    needsInfoDeposits: 0,
    connected: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFundingOverview() {
      try {
        const res = await fetch("/api/funding/admin/blc/deposit-requests", { cache: "no-store" })
        if (!res.ok) return
        const payload = await res.json()
        const requests = normalizeFundingResponse<BlcDepositRequest>(payload)

        setOverview({
          totalDeposits: requests.length,
          pendingDeposits: requests.filter((item) => item.status === "PENDING_REVIEW").length,
          approvedDeposits: requests.filter((item) => item.status === "APPROVED").length,
          needsInfoDeposits: requests.filter((item) => item.status === "NEEDS_MORE_INFO").length,
          connected: true,
        })
      } finally {
        setLoading(false)
      }
    }

    loadFundingOverview()
  }, [])

  const stats = [
    {
      title: "Depósitos",
      value: loading ? "—" : overview.connected ? overview.totalDeposits : "Parcial",
      icon: <IconArrowDownLeft className="size-5" />,
      change: {
        value: 0,
        label: overview.connected ? "funding-core" : "gateway",
      },
    },
    {
      title: "Retiros",
      value: "Parcial",
      icon: <IconArrowUpRight className="size-5" />,
      change: {
        value: 0,
        label: "orchestrator",
      },
    },
    {
      title: "Remesas",
      value: "Parcial",
      icon: <IconBuildingBank className="size-5" />,
      change: {
        value: 0,
        label: "remittances",
      },
    },
    {
      title: "Pagos a comercios",
      value: "Parcial",
      icon: <IconCashBanknote className="size-5" />,
      change: {
        value: 0,
        label: "DECOPAY",
      },
    },
  ]

  const modules = [
    {
      title: "Depósitos",
      description: "Solicitudes BLC registradas en funding-core.",
      href: "/operaciones/fondos/depositos",
      icon: <IconArrowDownLeft className="size-6" />,
      stats: overview.connected
        ? `${overview.pendingDeposits} pendientes`
        : "Conexión inicial",
      color: "from-emerald-500/10 to-emerald-500/5",
      state: "partial" as const,
      percent: 85,
    },
    {
      title: "Retiros",
      description: "Retiros gestionados por withdrawal-orchestrator.",
      href: "/operaciones/fondos/retiros",
      icon: <IconArrowUpRight className="size-6" />,
      stats: "Cola conectada",
      color: "from-rose-500/10 to-rose-500/5",
      state: "partial" as const,
      percent: 60,
    },
    {
      title: "Remesas",
      description: "Transferencias internacionales por región.",
      href: "/operaciones/fondos/remesas",
      icon: <IconBuildingBank className="size-6" />,
      stats: "Listado conectado",
      color: "from-blue-500/10 to-blue-500/5",
      state: "partial" as const,
      percent: 55,
    },
    {
      title: "Pagos a comercios",
      description: "Cobros y pagos comerciales del ecosistema.",
      href: "/operaciones/fondos/pagos-comercios",
      icon: <IconCashBanknote className="size-6" />,
      stats: "DECOPAY conectado",
      color: "from-purple-500/10 to-purple-500/5",
      state: "partial" as const,
      percent: 65,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Fondos"
        description="Control de entradas, salidas, remesas y pagos comerciales."
        state="partial"
        percent={65}
        note="Depósitos BLC, retiros, remesas y pagos DECOPAY ya pasan por Gateway Admin; faltan conciliaciones avanzadas."
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className={`bg-gradient-to-br ${module.color} cursor-pointer transition-all hover:shadow-md`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {module.icon}
                  </div>
                  <IconChartLine className="size-5 text-muted-foreground" />
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
              <p className="text-sm text-muted-foreground">Pendientes de aprobación</p>
              <p className="text-2xl font-bold">
                {loading ? "—" : overview.pendingDeposits}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">En proceso</p>
              <p className="text-2xl font-bold">
                {loading ? "—" : overview.needsInfoDeposits}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completados hoy</p>
              <p className="text-2xl font-bold">
                {loading ? "—" : overview.approvedDeposits}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rechazados</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
