"use client"

import { MarketPairsPanel, OpenOrdersPanel, OrderBookPanel, RecentTradesPanel, SpotChartPanel, SpotOrderForm } from "../spot-market-widgets"
import { SpotMarketCard } from "../spot-market-card"
import { marketPairs, orderBook, recentTrades, type SpotMarketPair, type SpotOrderBookDisplay, type SpotStat, type SpotTradeDisplay } from "../spot-market-data"

export function TerminalView({
  pairs = marketPairs,
  activePair = marketPairs[0],
  stats,
  orderBook: book = orderBook,
  trades = recentTrades,
}: {
  pairs?: SpotMarketPair[]
  activePair?: SpotMarketPair
  stats?: SpotStat[]
  orderBook?: SpotOrderBookDisplay
  trades?: SpotTradeDisplay[]
}) {
  const terminalStats = stats ?? [
    { label: "Precio", value: activePair.price },
    { label: "24h", value: activePair.change },
    { label: "Spread", value: "0.02%" },
  ]

  return (
    <div className="space-y-5">
      <SpotMarketCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Terminal Spot</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{activePair.pair}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Grafica, profundidad, trades y ejecucion en una sola vista.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {terminalStats.slice(1, 4).map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-background px-3 py-2">
                <p className="text-muted-foreground">{label}</p>
                <p className="font-black text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </SpotMarketCard>

      <div className="grid gap-5 xl:grid-cols-[300px_1fr_360px]">
        <MarketPairsPanel dense pairs={pairs} />
        <div className="space-y-5">
          <SpotChartPanel pair={activePair} />
          <OpenOrdersPanel />
        </div>
        <div className="space-y-5">
          <SpotOrderForm />
          <OrderBookPanel data={book} midPrice={activePair.price} />
          <RecentTradesPanel trades={trades} />
        </div>
      </div>
    </div>
  )
}
