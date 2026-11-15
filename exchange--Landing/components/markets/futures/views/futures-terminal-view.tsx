"use client"

import { FuturesMarketCard } from "../futures-market-card"
import { FuturesChartPanel, FuturesOrderBookPanel, FuturesOrderForm, FuturesPairsPanel, FuturesTradesPanel, PositionsPanel } from "../futures-market-widgets"
import {
  futuresOrderBook,
  futuresPairs,
  futuresTrades,
  type FuturesOrderBookDisplay,
  type FuturesPair,
  type FuturesTradeDisplay,
} from "../futures-market-data"

export function FuturesTerminalView({
  pairs = futuresPairs,
  activePair = futuresPairs[0],
  orderBook = futuresOrderBook,
  trades = futuresTrades,
}: {
  pairs?: FuturesPair[]
  activePair?: FuturesPair
  orderBook?: FuturesOrderBookDisplay
  trades?: FuturesTradeDisplay[]
}) {
  return (
    <div className="space-y-5">
      <FuturesMarketCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Terminal futuros</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{activePair.pair}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Gráfica, profundidad, posiciones, riesgo y orden long/short en una sola vista.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["Funding", activePair.funding],
              ["Margen", "Cross"],
              ["Leverage", activePair.leverage],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background px-3 py-2">
                <p className="text-muted-foreground">{label}</p>
                <p className="font-black text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </FuturesMarketCard>

      <div className="grid gap-5 xl:grid-cols-[300px_1fr_360px]">
        <FuturesPairsPanel dense pairs={pairs} />
        <div className="space-y-5">
          <FuturesChartPanel pair={activePair} />
          <PositionsPanel compact />
        </div>
        <div className="space-y-5">
          <FuturesOrderForm />
          <FuturesOrderBookPanel data={orderBook} midPrice={activePair.price} />
          <FuturesTradesPanel trades={trades} />
        </div>
      </div>
    </div>
  )
}
