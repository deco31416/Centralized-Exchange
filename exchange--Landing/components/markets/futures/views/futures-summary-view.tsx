"use client"

import { Button } from "@/components/ui/button"
import type { FuturesMarketView, FuturesPair, FuturesStat } from "../futures-market-data"
import { futuresPairs, futuresStats } from "../futures-market-data"
import { FuturesMarketCard } from "../futures-market-card"
import { FuturesChartPanel, FuturesStatsGrid, PositionsPanel, RiskPanel } from "../futures-market-widgets"

export function FuturesSummaryView({
  onNavigate,
  pairs = futuresPairs,
  activePair = futuresPairs[0],
  stats = futuresStats,
  dataSource = "fallback",
}: {
  onNavigate: (view: FuturesMarketView) => void
  pairs?: FuturesPair[]
  activePair?: FuturesPair
  stats?: FuturesStat[]
  dataSource?: "backend" | "fallback"
}) {
  return (
    <div className="space-y-5">
      <FuturesStatsGrid stats={stats} />

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <FuturesMarketCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Resumen futuros</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">Contratos con margen controlado</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Opera long o short con lectura clara de funding, margen, liquidación y posiciones abiertas.
              </p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                Datos {dataSource === "backend" ? "conectados al BFF" : "en fallback de experiencia"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full" onClick={() => onNavigate("terminal")}>Abrir terminal</Button>
              <Button variant="outline" className="rounded-full" onClick={() => onNavigate("risk")}>Ver riesgo</Button>
            </div>
          </div>
          <div className="mt-5">
            <FuturesChartPanel compact pair={activePair} />
          </div>
        </FuturesMarketCard>

        <div className="space-y-5">
          <RiskPanel />
          <PositionsPanel compact />
        </div>
      </div>

      <FuturesMarketCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-foreground">Contratos destacados</h3>
            <p className="mt-1 text-sm text-muted-foreground">Perpetuos con liquidez, funding y apalancamiento definido.</p>
          </div>
          <Button variant="outline" className="w-fit rounded-full" onClick={() => onNavigate("terminal")}>Operar</Button>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {pairs.map((pair) => (
            <button key={pair.pair} onClick={() => onNavigate("terminal")} className="rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-foreground">{pair.pair}</p>
                  <p className="text-xs text-muted-foreground">{pair.leverage} · funding {pair.funding}</p>
                </div>
                <span className={pair.change.startsWith("+") ? "text-sm font-black text-emerald-500" : "text-sm font-black text-red-500"}>{pair.change}</span>
              </div>
              <p className="mt-3 text-xl font-black text-foreground">{pair.price}</p>
            </button>
          ))}
        </div>
      </FuturesMarketCard>
    </div>
  )
}
