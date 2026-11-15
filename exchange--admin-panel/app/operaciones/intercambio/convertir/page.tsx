"use client"

import { StatsCards } from "@/components/operaciones/stats-cards"
import { formatPricingCount, usePricingOverview } from "@/components/operaciones/use-pricing-overview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconRepeat,
  IconCoin,
  IconExchange,
  IconArrowRight,
} from "@tabler/icons-react"
import Link from "next/link"

export default function ConvertirIntercambioPage() {
  const pricing = usePricingOverview()

  const stats = [
    {
      title: "Activos con precio",
      value: pricing.loading ? "—" : formatPricingCount(pricing.assetCount),
      icon: <IconCoin className="size-5" />,
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
      icon: <IconExchange className="size-5" />,
      change: {
        value: 0,
        label: "assets",
      },
    },
    {
      title: "Tasa promedio",
      value: pricing.loading ? "—" : pricing.averagePriceUsd,
      icon: <IconArrowRight className="size-5" />,
      change: {
        value: 0,
        label: "pricing",
      },
    },
  ]

  const conversionTypes = [
    {
      title: "Fiat → Crypto",
      description: "Conversión directa de fiat a cripto.",
      href: "/operaciones/intercambio/convertir/fiat-crypto",
      icon: <IconArrowRight className="size-6" />,
      stats: "Pricing conectado",
      color: "from-blue-500/10 to-blue-500/5",
      badge: "Rápido",
      state: "partial" as const,
      percent: 45,
    },
    {
      title: "Crypto → Fiat",
      description: "Conversión directa de cripto a fiat.",
      href: "/operaciones/intercambio/convertir/crypto-fiat",
      icon: <IconArrowRight className="size-6" />,
      stats: "Pricing conectado",
      color: "from-emerald-500/10 to-emerald-500/5",
      state: "partial" as const,
      percent: 45,
    },
    {
      title: "Fiat → Fiat",
      description: "Conversión entre monedas fiat",
      href: "/operaciones/intercambio/convertir/fiat-fiat",
      icon: <IconArrowRight className="size-6" />,
      stats: "Pricing conectado",
      color: "from-amber-500/10 to-amber-500/5",
      state: "partial" as const,
      percent: 45,
    },
    {
      title: "Crypto → Crypto",
      description: "Swap entre criptomonedas",
      href: "/operaciones/intercambio/convertir/crypto-crypto",
      icon: <IconArrowRight className="size-6" />,
      stats: "Pricing conectado",
      color: "from-purple-500/10 to-purple-500/5",
      state: "partial" as const,
      percent: 45,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Convertir activos"
        description="Conversiones directas entre monedas fiat, criptoactivos y saldos internos."
        state="partial"
        percent={45}
        note="Pricing y matriz de pares conectados; falta crear ejecución, cotización bloqueada y registro contable."
      />

      {pricing.error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pricing.error}
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Conversion Types */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
        {conversionTypes.map((type) => (
          <Link key={type.href} href={type.href}>
            <Card className={`bg-gradient-to-br ${type.color} cursor-pointer transition-all hover:shadow-md relative`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {type.icon}
                  </div>
                  {type.badge && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                      {type.badge}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CardTitle>{type.title}</CardTitle>
                  <ConnectionStatusBadge state={type.state} percent={type.percent} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
                <p className="text-sm font-semibold text-primary">
                  {type.stats}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
