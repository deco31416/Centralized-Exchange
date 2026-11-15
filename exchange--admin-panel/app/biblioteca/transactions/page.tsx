"use client"

import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconReceipt, IconClock, IconCheck, IconX, IconAlertTriangle, IconFileAnalytics } from "@tabler/icons-react"
import Link from "next/link"
import { useWalletTransactions } from "@/components/biblioteca/transactions/use-wallet-transactions"

export default function TransactionsPage() {
  const { summary, loading, error } = useWalletTransactions()
  const totalStr = loading ? "—" : summary.total.toLocaleString()
  const loadedStr = loading ? "—" : summary.loaded.toLocaleString()
  const adjustmentsStr = loading ? "—" : summary.adjustments.toLocaleString()
  const fiatDepositsStr = loading ? "—" : summary.fiatDeposits.toLocaleString()
  const p2pTransfersStr = loading ? "—" : summary.p2pTransfers.toLocaleString()

  const overviewStats = [
    {
      title: "Total transacciones",
      value: totalStr,
      change: { value: 0, label: "ledger" },
      icon: <IconReceipt className="size-5" />,
    },
    {
      title: "Ajustes",
      value: adjustmentsStr,
      change: { value: 0, label: "tipo ADJUSTMENT" },
      icon: <IconClock className="size-5" />,
    },
    {
      title: "Depósitos fiat",
      value: fiatDepositsStr,
      change: { value: 0, label: "tipo FIAT_DEPOSIT_CONFIRMED" },
      icon: <IconCheck className="size-5" />,
    },
    {
      title: "Transferencias P2P",
      value: p2pTransfersStr,
      change: { value: 0, label: "tipo P2P_TRANSFER" },
      icon: <IconX className="size-5" />,
    },
  ]

  const modules = [
    {
      title: "Todas las transacciones",
      href: "/biblioteca/transactions/todas",
      icon: <IconReceipt className="size-5" />,
      gradient: "from-blue-500 to-cyan-600",
      count: `${totalStr} registros`,
      state: error ? "partial" as const : "connected" as const,
      percent: error ? 65 : 100,
    },
    {
      title: "Transacciones pendientes",
      href: "/biblioteca/transactions/pendientes",
      icon: <IconClock className="size-5" />,
      gradient: "from-amber-500 to-orange-600",
      count: "Vista por conectar",
      state: "pending" as const,
      percent: 20,
    },
    {
      title: "Transacciones completadas",
      href: "/biblioteca/transactions/completadas",
      icon: <IconCheck className="size-5" />,
      gradient: "from-emerald-500 to-green-600",
      count: `${loadedStr} cargadas`,
      state: error ? "partial" as const : "connected" as const,
      percent: error ? 65 : 100,
    },
    {
      title: "Transacciones fallidas",
      href: "/biblioteca/transactions/fallidas",
      icon: <IconX className="size-5" />,
      gradient: "from-red-500 to-pink-600",
      count: "Vista por conectar",
      state: "pending" as const,
      percent: 20,
    },
    {
      title: "Disputas & Chargebacks",
      href: "/biblioteca/transactions/disputas",
      icon: <IconAlertTriangle className="size-5" />,
      gradient: "from-purple-500 to-violet-600",
      count: "Vista por conectar",
      state: "pending" as const,
      percent: 10,
    },
    {
      title: "Reportes de transacciones",
      href: "/biblioteca/transactions/reportes",
      icon: <IconFileAnalytics className="size-5" />,
      gradient: "from-teal-500 to-cyan-600",
      count: "Vista por conectar",
      state: "pending" as const,
      percent: 10,
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Gestión de transacciones"
        description="Control del ledger, movimientos, disputas y reportes operativos."
        state={error ? "partial" : "connected"}
        percent={error ? 65 : 72}
        note={error ? "No se pudo consultar wallet-ledger en este momento." : "Todas y completadas leen wallet-ledger por Gateway Admin; estados externos, disputas y reportes siguen en integración."}
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
        <h3 className="mb-4 font-semibold text-foreground">Resumen del ledger</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Total transacciones en ledger</span>
            <span className="font-medium tabular-nums text-foreground">{totalStr}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Fuente de datos</span>
            <span className="font-medium tabular-nums text-emerald-600">Gateway Admin / wallet-ledger</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Tipos de transacción</span>
            <span className="font-medium tabular-nums text-blue-600">FIAT_DEPOSIT, P2P, ADJUSTMENT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API endpoint</span>
            <span className="font-medium tabular-nums text-amber-600">GET /api/wallet/admin/transactions</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
