"use client"

import { TradingProCard } from "../trading-pro-card"
import { AdvancedOrderForm, ActiveStrategiesPanel, TradingProChart } from "../trading-pro-widgets"
import { tradingProFallbackPair, type TradingProOrderMode, type TradingProPair } from "../trading-pro-data"

export function TradingProOrderView({
  mode,
  eyebrow,
  title,
  description,
  activePair = tradingProFallbackPair,
}: {
  mode: TradingProOrderMode
  eyebrow: string
  title: string
  description: string
  activePair?: TradingProPair
}) {
  return (
    <div className="space-y-5">
      <TradingProCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </TradingProCard>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <TradingProChart pair={activePair} />
          <ActiveStrategiesPanel compact />
        </div>
        <AdvancedOrderForm mode={mode} pair={activePair} />
      </div>
    </div>
  )
}
