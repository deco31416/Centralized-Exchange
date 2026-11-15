"use client"

import { StatsCards } from "@/components/operaciones/stats-cards"
import { formatPricingCount, usePricingOverview } from "@/components/operaciones/use-pricing-overview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconExchange,
  IconShoppingCart,
  IconCash,
  IconRepeat,
} from "@tabler/icons-react"
import Link from "next/link"

export default function IntercambioInternoPage() {
  const pricing = usePricingOverview()

  const stats = [
    {
      title: "Activos con precio",
      value: pricing.loading ? "—" : formatPricingCount(pricing.assetCount),
      icon: <IconExchange className="size-5" />,
      change: {
        value: 0,
        label: "pricing",
      },
    },
    {
      title: "Pares disponibles",
      value: pricing.loading ? "—" : formatPricingCount(pricing.pairCount),
      icon: <IconRepeat className="size-5" />,
      change: {
        value: 0,
        label: "matrix",
      },
    },
    {
      title: "Fiat / Cripto",
      value: pricing.loading ? "—" : `${formatPricingCount(pricing.fiatCount)} / ${formatPricingCount(pricing.cryptoCount)}`,
      icon: <IconShoppingCart className="size-5" />,
      change: {
        value: 0,
        label: "assets",
      },
    },
    {
      title: "Tasa promedio",
      value: pricing.loading ? "—" : pricing.averagePriceUsd,
      icon: <IconCash className="size-5" />,
      change: {
        value: 0,
        label: "pricing",
      },
    },
  ]

  const modules = [
    {
      title: "Compras",
      description: "Flujos de compra entre fiat y cripto.",
      href: "/operaciones/intercambio/compras",
      icon: <IconShoppingCart className="size-6" />,
      stats: "Pricing conectado",
      color: "from-blue-500/10 to-blue-500/5",
      state: "partial" as const,
      percent: 45,
      subItems: [
        "Fiat → Crypto",
        "Crypto → Fiat",
        "Fiat → Fiat",
        "Crypto → Crypto",
      ],
    },
    {
      title: "Ventas",
      description: "Flujos de venta entre cripto y fiat.",
      href: "/operaciones/intercambio/ventas",
      icon: <IconCash className="size-6" />,
      stats: "Pricing conectado",
      color: "from-emerald-500/10 to-emerald-500/5",
      state: "partial" as const,
      percent: 45,
      subItems: [
        "Fiat → Crypto",
        "Crypto → Fiat",
        "Fiat → Fiat",
        "Crypto → Crypto",
      ],
    },
    {
      title: "Convertir",
      description: "Conversión directa entre activos.",
      href: "/operaciones/intercambio/convertir",
      icon: <IconRepeat className="size-6" />,
      stats: "Pricing conectado",
      color: "from-purple-500/10 to-purple-500/5",
      state: "partial" as const,
      percent: 45,
      subItems: [
        "Fiat → Crypto",
        "Crypto → Fiat",
        "Fiat → Fiat",
        "Crypto → Crypto",
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Intercambio interno"
        description="Gestión de compras, ventas y conversiones entre activos."
        state="partial"
        percent={45}
        note="Pricing y matriz de pares conectados por Gateway Admin; falta crear el motor de ejecución para compra, venta, conversión y liquidación."
      />

      {pricing.error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pricing.error}
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className={`bg-gradient-to-br ${module.color} cursor-pointer transition-all hover:shadow-md`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {module.icon}
                  </div>
                  <IconExchange className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CardTitle>{module.title}</CardTitle>
                  <ConnectionStatusBadge state={module.state} percent={module.percent} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
                <p className="text-sm font-semibold text-primary">
                  {module.stats}
                </p>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Tipos de conversión:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.subItems.map((item) => (
                      <span
                        key={item}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
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
              <p className="text-sm text-muted-foreground">Fiat → Crypto</p>
              <p className="text-2xl font-bold">{pricing.loading ? "—" : formatPricingCount(pricing.pairCount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Crypto → Fiat</p>
              <p className="text-2xl font-bold">{pricing.loading ? "—" : formatPricingCount(pricing.pairCount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fiat → Fiat</p>
              <p className="text-2xl font-bold">{pricing.loading ? "—" : formatPricingCount(pricing.fiatCount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Crypto → Crypto</p>
              <p className="text-2xl font-bold">{pricing.loading ? "—" : formatPricingCount(pricing.cryptoCount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
