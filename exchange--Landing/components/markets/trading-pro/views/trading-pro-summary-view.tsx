"use client"

import { Button } from "@/components/ui/button"
import type { TradingProPair, TradingProStat, TradingProView } from "../trading-pro-data"
import { tradingProFallbackPair, tradingProStats } from "../trading-pro-data"
import { TradingProCard } from "../trading-pro-card"
import { ActiveStrategiesPanel, ExecutionModesPanel, TradingProChart, TradingProStatsGrid } from "../trading-pro-widgets"

export function TradingProSummaryView({
  onNavigate,
  activePair = tradingProFallbackPair,
  stats = tradingProStats,
  dataSource = "fallback",
}: {
  onNavigate: (view: TradingProView) => void
  activePair?: TradingProPair
  stats?: TradingProStat[]
  dataSource?: "backend" | "fallback"
}) {
  return (
    <div className="space-y-5">
      <TradingProStatsGrid stats={stats} />

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <TradingProCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Resumen pro</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">Ejecución avanzada sin salir del flujo</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Configura entradas, salidas y protección con órdenes limit, market, stop-limit, OCO y TP/SL.
              </p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                Datos {dataSource === "backend" ? "conectados al BFF" : "en fallback de experiencia"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full" onClick={() => onNavigate("standard")}>Crear orden</Button>
              <Button variant="outline" className="rounded-full" onClick={() => onNavigate("oco")}>Crear OCO</Button>
            </div>
          </div>
          <div className="mt-5">
            <TradingProChart compact pair={activePair} />
          </div>
        </TradingProCard>

        <ActiveStrategiesPanel compact />
      </div>

      <ExecutionModesPanel onSelect={onNavigate} />
    </div>
  )
}
