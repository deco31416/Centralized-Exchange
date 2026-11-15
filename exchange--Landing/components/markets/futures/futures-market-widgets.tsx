"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketChart } from "../market-chart"
import { FuturesMarketCard } from "./futures-market-card"
import {
  futuresOrderBook,
  futuresHistory,
  futuresPairs,
  futuresStats,
  futuresTrades,
  openPositions,
  type FuturesOrderBookDisplay,
  type FuturesPair,
  type FuturesStat,
  type FuturesTradeDisplay,
} from "./futures-market-data"

export function FuturesStatsGrid({ stats = futuresStats }: { stats?: FuturesStat[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <FuturesMarketCard key={stat.label} className="p-4">
          <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.detail}</p>
        </FuturesMarketCard>
      ))}
    </div>
  )
}

export function FuturesChartPanel({ compact = false, pair = futuresPairs[0] }: { compact?: boolean; pair?: FuturesPair }) {
  return <MarketChart pair={pair} compact={compact} />
}

export function FuturesPairsPanel({ dense = false, pairs = futuresPairs }: { dense?: boolean; pairs?: FuturesPair[] }) {
  return (
    <FuturesMarketCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Contratos</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{pairs.length} activos</span>
      </div>
      <div className="mt-4 grid gap-2">
        {pairs.map((pair) => (
          <div key={pair.pair} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-sm">
            <div>
              <p className="font-black text-foreground">{pair.pair}</p>
              <p className="text-xs text-muted-foreground">{pair.market} · {pair.leverage}</p>
            </div>
            <span className="font-bold text-foreground">{pair.price}</span>
            <span className={cn("text-xs font-black", pair.change.startsWith("+") ? "text-emerald-500" : "text-red-500")}>{pair.change}</span>
            {!dense && (
              <div className="col-span-3 flex flex-wrap gap-2 border-t border-border pt-2">
                <span className="rounded-full border border-border px-2 py-1 text-[11px] font-bold text-muted-foreground">Funding {pair.funding}</span>
                <span className="rounded-full border border-border px-2 py-1 text-[11px] font-bold text-muted-foreground">{pair.provider}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </FuturesMarketCard>
  )
}

export function FuturesOrderForm() {
  return (
    <FuturesMarketCard>
      <div className="flex rounded-full border border-border bg-background p-1 text-sm font-bold">
        <button className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-white">Long</button>
        <button className="flex-1 rounded-full px-4 py-2 text-muted-foreground">Short</button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold">
        {["Cross", "25x", "Limit"].map((item) => (
          <button key={item} className="rounded-full border border-border bg-background px-3 py-2 text-foreground">{item}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {[
          ["Precio", "67,438.10 USDT"],
          ["Tamaño", "0.50 BTC"],
          ["Margen", "1,348.76 USDT"],
          ["Liquidación est.", "64,210.00 USDT"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {["10%", "25%", "50%", "100%"].map((item) => (
          <button key={item} className="rounded-full border border-border bg-background px-2 py-1 text-xs font-bold text-muted-foreground">{item}</button>
        ))}
      </div>
      <Button className="mt-4 w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-500/90">Abrir posición</Button>
    </FuturesMarketCard>
  )
}

export function FuturesOrderBookPanel({ data = futuresOrderBook, midPrice = "67,438.10" }: { data?: FuturesOrderBookDisplay; midPrice?: string }) {
  return (
    <FuturesMarketCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Profundidad perp</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">0.03% spread</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 px-2 text-[11px] font-bold uppercase text-muted-foreground">
        <span>Precio</span><span>Cantidad</span><span className="text-right">Total</span>
      </div>
      <div className="mt-4 space-y-1 text-xs">
        {data.asks.map(([price, amount, total]) => (
          <div key={`ask-${price}`} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1 text-red-500">
            <span>{price}</span><span>{amount}</span><span className="text-right">{total}</span>
          </div>
        ))}
        <div className="rounded-xl bg-background px-2 py-3 text-center text-xl font-black text-foreground">{midPrice}</div>
        {data.bids.map(([price, amount, total]) => (
          <div key={`bid-${price}`} className="grid grid-cols-3 gap-2 rounded-lg px-2 py-1 text-emerald-500">
            <span>{price}</span><span>{amount}</span><span className="text-right">{total}</span>
          </div>
        ))}
      </div>
    </FuturesMarketCard>
  )
}

export function FuturesTradesPanel({ trades = futuresTrades }: { trades?: FuturesTradeDisplay[] }) {
  return (
    <FuturesMarketCard>
      <h3 className="text-lg font-black text-foreground">Ejecuciones</h3>
      <div className="mt-4 space-y-2 text-xs">
        {trades.map((trade) => (
          <div key={`${trade.time}-${trade.amount}`} className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <span className={trade.side === "Long" ? "text-emerald-500" : "text-red-500"}>{trade.price}</span>
            <span className="text-muted-foreground">{trade.amount}</span>
            <span className="text-right text-muted-foreground">{trade.time}</span>
          </div>
        ))}
      </div>
    </FuturesMarketCard>
  )
}

export function PositionsPanel({ compact = false }: { compact?: boolean }) {
  const visiblePositions = compact ? openPositions.slice(0, 2) : openPositions
  const hiddenPositions = Math.max(openPositions.length - visiblePositions.length, 0)
  const listHeight = compact ? "max-h-[420px]" : "max-h-[620px]"

  return (
    <FuturesMarketCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-foreground">Posiciones</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {compact ? `${visiblePositions.length} de ${openPositions.length} abiertas` : "Abiertas, cerradas y ordenes recientes"}
          </p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{openPositions.length} activas</span>
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          {[
            ["Abiertas", openPositions.length],
            ["Cerradas", futuresHistory.length],
            ["Ordenes", futuresTrades.length],
          ].map(([label, count], index) => (
            <button
              key={label}
              className={cn(
                "rounded-full border border-border px-3 py-2",
                index === 0 ? "bg-foreground text-background" : "bg-background text-muted-foreground",
              )}
            >
              {label} · {count}
            </button>
          ))}
        </div>
      )}

      <div className={cn("mt-4 grid gap-2 overflow-y-auto pr-1", listHeight)}>
        {visiblePositions.map((position) => (
          <div key={position.id} className="rounded-xl border border-border bg-background p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-black text-foreground">{position.pair}</p>
                <p className="text-xs text-muted-foreground">{position.side} · {position.size} · {position.leverage}</p>
              </div>
              <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-black", position.pnl.startsWith("+") ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>{position.pnl}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs xl:grid-cols-4">
              {[
                ["Entrada", position.entry],
                ["Mark", position.mark],
                ["Margen", position.margin],
                ["Liq.", position.liquidation],
              ].map(([label, value]) => (
                <span key={label} className="min-w-0 text-muted-foreground">
                  {label}
                  <br />
                  <b className="break-words text-foreground">{value}</b>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {compact && hiddenPositions > 0 ? (
        <div className="mt-3 rounded-xl border border-border bg-background px-3 py-2 text-center text-xs font-bold text-muted-foreground">
          +{hiddenPositions} posiciones mas en la vista Posiciones
        </div>
      ) : null}
    </FuturesMarketCard>
  )
}

export function RiskPanel() {
  const riskMetrics = [
    ["Margen usado", "32%", "Mantener bajo 65%"],
    ["PnL no realizado", "+1,822.80", "USDT"],
    ["Distancia liquidación", "6.4%", "Posición principal"],
  ]

  return (
    <FuturesMarketCard>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Control de riesgo</p>
      <h3 className="mt-1 text-xl font-black text-foreground">Cuenta en rango operativo</h3>
      <div className="mt-4 space-y-2">
        {riskMetrics.map(([label, value, detail]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-[58%] text-sm font-bold leading-tight text-muted-foreground">{label}</p>
              <p className="shrink-0 text-right text-2xl font-black leading-none text-foreground">{value}</p>
            </div>
            <p className="mt-2 text-sm leading-snug text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
    </FuturesMarketCard>
  )
}
