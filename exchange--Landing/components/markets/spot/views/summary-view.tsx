"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SpotMarketPair, SpotMarketView, SpotStat, SpotTradeDisplay } from "../spot-market-data"
import { marketPairs as fallbackPairs, openOrders, recentTrades as fallbackTrades, spotStats as fallbackStats } from "../spot-market-data"
import { SpotMarketCard } from "../spot-market-card"
import { SpotChartPanel } from "../spot-market-widgets"

export function SummaryView({
  onNavigate,
  pairs = fallbackPairs,
  stats = fallbackStats,
  trades = fallbackTrades,
  activePair = fallbackPairs[0],
  dataSource = "fallback",
}: {
  onNavigate: (view: SpotMarketView) => void
  pairs?: SpotMarketPair[]
  stats?: SpotStat[]
  trades?: SpotTradeDisplay[]
  activePair?: SpotMarketPair
  dataSource?: "backend" | "fallback"
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <SpotMarketCard key={stat.label} className="p-4">
            <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </SpotMarketCard>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <SpotMarketCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Resumen spot</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">Mercado listo para operar</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Revisa el par activo, compara oportunidades y entra a la terminal cuando quieras ejecutar una orden.
              </p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                Datos {dataSource === "backend" ? "conectados al BFF" : "en fallback de experiencia"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full" onClick={() => onNavigate("terminal")}>Abrir terminal</Button>
              <Button variant="outline" className="rounded-full" onClick={() => onNavigate("pairs")}>Ver pares</Button>
            </div>
          </div>

          <div className="mt-5">
            <SpotChartPanel compact pair={activePair} />
          </div>
        </SpotMarketCard>

        <SpotMarketCard>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Actividad</p>
          <h3 className="mt-1 text-xl font-black text-foreground">Ordenes y trades</h3>
          <div className="mt-4 space-y-3">
            {openOrders.slice(0, 2).map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-background p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-foreground">{order.pair}</p>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{order.filled}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{order.side} {order.amount} · {order.type} {order.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-bold text-muted-foreground">Ultimos trades</p>
            <div className="mt-2 space-y-2">
              {trades.slice(0, 3).map((trade) => (
                <div key={`${trade.time}-${trade.amount}`} className="grid grid-cols-3 gap-2 text-xs">
                  <span className={trade.side === "buy" ? "text-emerald-500" : "text-red-500"}>{trade.price}</span>
                  <span className="text-muted-foreground">{trade.amount}</span>
                  <span className="text-right text-muted-foreground">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline" className="mt-5 w-full rounded-full" onClick={() => onNavigate("orders")}>Ver ordenes</Button>
        </SpotMarketCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <SpotMarketCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-foreground">Pares destacados</h3>
              <p className="mt-1 text-sm text-muted-foreground">Mercados con mayor actividad o seguimiento.</p>
            </div>
            <Button variant="outline" className="w-fit rounded-full" onClick={() => onNavigate("favorites")}>Favoritos</Button>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {pairs.slice(0, 4).map((pair) => (
              <button
                key={pair.pair}
                onClick={() => onNavigate("terminal")}
                className="rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-foreground">{pair.pair}</p>
                    <p className="text-xs text-muted-foreground">Vol {pair.volume}</p>
                  </div>
                  <span className={cn("text-sm font-black", pair.change.startsWith("+") ? "text-emerald-500" : "text-red-500")}>{pair.change}</span>
                </div>
                <p className="mt-3 text-xl font-black text-foreground">{pair.price}</p>
              </button>
            ))}
          </div>
        </SpotMarketCard>

        <SpotMarketCard>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Operacion rapida</p>
          <h3 className="mt-1 text-xl font-black text-foreground">Comprar o vender</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Entra a la terminal para definir tipo de orden, precio, cantidad y confirmacion.
          </p>
          <div className="mt-4 grid gap-2">
            {[
              ["Disponible", "8,420.00 USDT"],
              ["Orden sugerida", "Limit"],
              ["Riesgo", "Sin apalancamiento"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-xs font-bold text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-black text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full rounded-full" onClick={() => onNavigate("terminal")}>Operar BTC/USDT</Button>
        </SpotMarketCard>
      </div>
    </div>
  )
}
