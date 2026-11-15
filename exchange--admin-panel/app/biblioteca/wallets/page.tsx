"use client"

import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconWallet, IconCoin, IconFlame, IconSnowflake, IconDatabase, IconListCheck } from "@tabler/icons-react"
import Link from "next/link"
import { useWalletTransactions } from "@/components/biblioteca/transactions/use-wallet-transactions"
import { useAdminWallets } from "@/components/biblioteca/wallets/use-admin-wallets"

export default function WalletsPage() {
  const { summary: walletSummary, loading: walletsLoading, error: walletsError } = useAdminWallets()
  const { summary: txSummary, loading: txLoading, error: txError } = useWalletTransactions()
  const connected = !walletsError && !txError
  const walletsValue = walletsLoading ? "—" : walletSummary.total.toLocaleString()
  const fiatValue = walletsLoading ? "—" : walletSummary.fiat.toLocaleString()
  const cryptoValue = walletsLoading ? "—" : walletSummary.crypto.toLocaleString()
  const movementsValue = txLoading ? "—" : txSummary.total.toLocaleString()

  const overviewStats = [
    {
      title: "Wallets",
      value: walletsValue,
      change: { value: 0, label: "wallet-ledger" },
      icon: <IconWallet className="size-5" />,
    },
    {
      title: "Wallets cripto",
      value: cryptoValue,
      change: { value: 0, label: "por moneda" },
      icon: <IconCoin className="size-5" />,
    },
    {
      title: "Wallets fiat",
      value: fiatValue,
      change: { value: 0, label: "por moneda" },
      icon: <IconFlame className="size-5" />,
    },
    {
      title: "Movimientos",
      value: movementsValue,
      change: { value: 0, label: "ledger" },
      icon: <IconSnowflake className="size-5" />,
    },
  ]

  const modules = [
    {
      title: "Wallets Fiat",
      href: "/biblioteca/financial/balances",
      icon: <IconWallet className="size-5" />,
      gradient: "from-blue-500 to-cyan-600",
      count: `${fiatValue} wallets fiat`,
      state: walletsError ? "partial" as const : "connected" as const,
      percent: walletsError ? 65 : 100,
    },
    {
      title: "Wallets Crypto",
      href: "/biblioteca/wallets/crypto",
      icon: <IconCoin className="size-5" />,
      gradient: "from-amber-500 to-orange-600",
      count: `${cryptoValue} wallets cripto`,
      state: walletsError ? "partial" as const : "connected" as const,
      percent: walletsError ? 55 : 90,
    },
    {
      title: "Hot Wallets",
      href: "/biblioteca/wallets/hot",
      icon: <IconFlame className="size-5" />,
      gradient: "from-red-500 to-pink-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 15,
    },
    {
      title: "Cold Wallets",
      href: "/biblioteca/wallets/cold",
      icon: <IconSnowflake className="size-5" />,
      gradient: "from-cyan-500 to-blue-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 15,
    },
    {
      title: "Ledger & Transacciones",
      href: "/biblioteca/wallets/ledger",
      icon: <IconDatabase className="size-5" />,
      gradient: "from-purple-500 to-indigo-600",
      count: `${movementsValue} movimientos`,
      state: txError ? "partial" as const : "connected" as const,
      percent: txError ? 55 : 100,
    },
    {
      title: "Reconciliación",
      href: "/biblioteca/wallets/reconciliacion",
      icon: <IconListCheck className="size-5" />,
      gradient: "from-emerald-500 to-green-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 15,
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Wallets y ledger"
        description="Gestión de wallets, custodia, saldos y movimientos contables."
        state={connected ? "partial" : "pending"}
        percent={connected ? 58 : 35}
        note={connected ? "Wallets, balances y ledger consultan wallet-ledger por Gateway Admin; custodia hot/cold y reconciliación siguen pendientes." : "No se pudo consultar wallet-ledger en este momento."}
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
        <h3 className="mb-4 font-semibold text-foreground">Resumen de wallets</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Movimientos hoy</span>
            <span className="font-medium tabular-nums text-foreground">{movementsValue}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Wallets nuevas hoy</span>
            <span className="font-medium tabular-nums text-foreground">{walletSummary.loaded.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Reconciliaciones pendientes</span>
            <span className="font-medium tabular-nums text-foreground">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Custodias activas</span>
            <span className="font-medium tabular-nums text-foreground">{walletsLoading ? "—" : walletSummary.active.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
