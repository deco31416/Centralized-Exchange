"use client"

import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconCoin, IconCurrencyDollar, IconArrowsShuffle, IconSettings, IconNetwork } from "@tabler/icons-react"
import Link from "next/link"
import { useAdminAssets } from "@/components/biblioteca/assets/use-admin-assets"

export default function AssetsPage() {
  const { summary, loading, error } = useAdminAssets()
  const totalStr = loading ? "—" : summary.total.toLocaleString()
  const cryptoStr = loading ? "—" : summary.crypto.toLocaleString()
  const fiatStr = loading ? "—" : summary.fiat.toLocaleString()
  const convertibleStr = loading ? "—" : summary.convertible.toLocaleString()

  const overviewStats = [
    {
      title: "Catálogo",
      value: totalStr,
      change: { value: 0, label: "asset-registry" },
      icon: <IconCoin className="size-5" />,
    },
    {
      title: "Activos cripto",
      value: cryptoStr,
      change: { value: 0, label: "catálogo" },
      icon: <IconCoin className="size-5" />,
    },
    {
      title: "Activos fiat",
      value: fiatStr,
      change: { value: 0, label: "catálogo" },
      icon: <IconCurrencyDollar className="size-5" />,
    },
    {
      title: "Convertibles",
      value: convertibleStr,
      change: { value: 0, label: "canConvert" },
      icon: <IconArrowsShuffle className="size-5" />,
    },
  ]

  const modules = [
    {
      title: "Activos cripto",
      href: "/biblioteca/assets/crypto",
      icon: <IconCoin className="size-5" />,
      gradient: "from-amber-500 to-orange-600",
      count: `${cryptoStr} activos`,
      state: error ? "partial" as const : "connected" as const,
      percent: error ? 70 : 100,
    },
    {
      title: "Activos fiat",
      href: "/biblioteca/assets/fiat",
      icon: <IconCurrencyDollar className="size-5" />,
      gradient: "from-green-500 to-emerald-600",
      count: `${fiatStr} activos`,
      state: error ? "partial" as const : "connected" as const,
      percent: error ? 70 : 100,
    },
    {
      title: "Pares de trading",
      href: "/biblioteca/assets/pares",
      icon: <IconArrowsShuffle className="size-5" />,
      gradient: "from-blue-500 to-cyan-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 15,
    },
    {
      title: "Catálogo de activos",
      href: "/configuracion/catalogo-activos",
      icon: <IconSettings className="size-5" />,
      gradient: "from-purple-500 to-indigo-600",
      count: `${totalStr} activos`,
      state: error ? "partial" as const : "connected" as const,
      percent: error ? 75 : 100,
    },
    {
      title: "Redes & Chains",
      href: "/biblioteca/assets/redes",
      icon: <IconNetwork className="size-5" />,
      gradient: "from-teal-500 to-cyan-600",
      count: "Vista local",
      state: "pending" as const,
      percent: 20,
    },
    {
      title: "Canales de fondeo",
      href: "/biblioteca/assets/canales-fondeo",
      icon: <IconCurrencyDollar className="size-5" />,
      gradient: "from-slate-500 to-zinc-600",
      count: "Conexión inicial",
      state: "partial" as const,
      percent: 80,
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Biblioteca de activos"
        description="Catálogo de criptoactivos, monedas fiat, pares, redes y canales de fondeo."
        state={error ? "partial" : "connected"}
        percent={error ? 55 : 82}
        note="Catálogo, cripto, fiat y canales consultan asset-registry por Gateway Admin; pares/redes operativas siguen en integración."
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
        <h3 className="mb-4 font-semibold text-foreground">Resumen de activos</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Volumen 24h</span>
            <span className="font-medium tabular-nums text-foreground">—</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Activos registrados</span>
            <span className="font-medium tabular-nums text-foreground">{totalStr}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Pares más operados</span>
            <span className="font-medium tabular-nums text-foreground">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Activos habilitados</span>
            <span className="font-medium tabular-nums text-foreground">{loading ? "—" : summary.enabled.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
