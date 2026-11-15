"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketChart } from "../market-chart"
import { TradingProCard } from "./trading-pro-card"
import {
  activeStrategies,
  executionModes,
  tradingProFallbackPair,
  tradingProStats,
  type TradingProOrderMode,
  type TradingProPair,
  type TradingProStat,
} from "./trading-pro-data"

export function TradingProStatsGrid({ stats = tradingProStats }: { stats?: TradingProStat[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <TradingProCard key={stat.label} className="p-4">
          <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.detail}</p>
        </TradingProCard>
      ))}
    </div>
  )
}

export function TradingProChart({ compact = false, pair = tradingProFallbackPair }: { compact?: boolean; pair?: TradingProPair }) {
  return <MarketChart pair={pair} compact={compact} />
}

export function ExecutionModesPanel({ onSelect }: { onSelect: (view: typeof executionModes[number]["view"]) => void }) {
  return (
    <TradingProCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Estrategias</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">4 modos</span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {executionModes.map((mode) => (
          <button key={mode.title} onClick={() => onSelect(mode.view)} className="rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{mode.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{mode.description}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{mode.status}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{mode.detail}</p>
          </button>
        ))}
      </div>
    </TradingProCard>
  )
}

export function AdvancedOrderForm({ mode, pair = tradingProFallbackPair }: { mode: TradingProOrderMode; pair?: TradingProPair }) {
  const title = {
    standard: "Limit / Market",
    stop: "Stop-limit",
    oco: "OCO",
    tpsl: "TP/SL",
  }[mode]

  const fields = {
    standard: [
      ["Tipo", "Limit"],
      ["Precio", `${pair.price} USDT`],
      ["Cantidad", `0.20 ${pair.symbol.replace("USDT", "")}`],
      ["Total", "13,484.10 USDT"],
    ],
    stop: [
      ["Trigger", `${pair.price} USDT`],
      ["Precio límite", `${pair.price} USDT`],
      ["Cantidad", `0.20 ${pair.symbol.replace("USDT", "")}`],
      ["Expiración", "GTC"],
    ],
    oco: [
      ["Take profit", "69,800.00 USDT"],
      ["Stop trigger", "65,900.00 USDT"],
      ["Stop limit", "65,840.00 USDT"],
      ["Cantidad", `0.20 ${pair.symbol.replace("USDT", "")}`],
    ],
    tpsl: [
      ["Entrada", `${pair.price} USDT`],
      ["Take profit", "+4.50%"],
      ["Stop loss", "-1.80%"],
      ["Tamaño", `0.80 ${pair.symbol.replace("USDT", "")}`],
    ],
  }[mode]

  return (
    <TradingProCard>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{title}</p>
          <h3 className="mt-1 text-xl font-black text-foreground">Configurar orden</h3>
        </div>
        <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">{pair.pair}</span>
      </div>
      <div className="mt-4 flex rounded-full border border-border bg-background p-1 text-sm font-bold">
        <button className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-white">Comprar</button>
        <button className="flex-1 rounded-full px-4 py-2 text-muted-foreground">Vender</button>
      </div>
      <div className="mt-4 grid gap-3">
        {fields.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {["25%", "50%", "75%", "100%"].map((item) => (
          <button key={item} className="rounded-full border border-border bg-background px-2 py-1 text-xs font-bold text-muted-foreground">{item}</button>
        ))}
      </div>
      <Button className="mt-4 w-full rounded-full">Crear estrategia</Button>
    </TradingProCard>
  )
}

export function ActiveStrategiesPanel({ compact = false }: { compact?: boolean }) {
  return (
    <TradingProCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Órdenes avanzadas</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{activeStrategies.length} activas</span>
      </div>
      <div className="mt-4 grid gap-2">
        {activeStrategies.slice(0, compact ? 2 : activeStrategies.length).map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-background p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{item.pair}</p>
                <p className="text-xs text-muted-foreground">{item.mode} · {item.side} · {item.amount}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-black", item.status === "Activa" ? "bg-emerald-500 text-white" : "bg-foreground text-background")}>{item.status}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{item.trigger}</p>
            <p className="mt-1 text-xs text-muted-foreground">Creada {item.time}</p>
          </div>
        ))}
      </div>
    </TradingProCard>
  )
}
