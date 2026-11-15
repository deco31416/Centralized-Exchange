"use client"

import { Button } from "@/components/ui/button"
import { MarketMakerCard } from "../market-maker-card"
import { makerStats, productBadge } from "../market-maker-data"
import type { MarketMakerView } from "../market-maker-data"

export function DashboardView({ onNavigate }: { onNavigate: (view: MarketMakerView) => void }) {
  const BadgeIcon = productBadge.icon

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {makerStats.map((stat) => (
          <MarketMakerCard key={stat.label} className="p-4">
            <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </MarketMakerCard>
        ))}
      </div>

      <MarketMakerCard>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
              <BadgeIcon className="h-3.5 w-3.5 text-primary" />
              {productBadge.label}
            </div>
            <h2 className="text-2xl font-black text-foreground">Oportunidades de liquidez</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Monetiza tu cupo disponible con operaciones OTC o condiciones preferenciales para la mesa Deco.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => onNavigate("offers")}>Publicar oferta</Button>
            <Button variant="outline" className="rounded-full" onClick={() => onNavigate("deco-liquidity")}>Ofrecer cupo a Deco</Button>
          </div>
        </div>
      </MarketMakerCard>

    </div>
  )
}
