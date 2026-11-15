"use client"

import type { OrderMarket } from "../order-history-data"
import { OrderHistoryCard } from "../order-history-card"
import { HistoryFiltersPanel, OrdersTable } from "../order-history-widgets"

export function OrderHistoryMarketView({
  market,
  title,
  description,
}: {
  market: OrderMarket
  title: string
  description: string
}) {
  return (
    <div className="space-y-5">
      <OrderHistoryCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{market}</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </OrderHistoryCard>
      <HistoryFiltersPanel />
      <OrdersTable market={market} />
    </div>
  )
}
