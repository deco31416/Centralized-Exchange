"use client"

import { orderHistory } from "../spot-market-data"
import { SpotMarketCard } from "../spot-market-card"

export function HistoryView() {
  return (
    <SpotMarketCard>
      <h2 className="text-xl font-black text-foreground">Historial spot</h2>
      <p className="mt-1 text-sm text-muted-foreground">Operaciones recientes, fills y cancelaciones.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {[
          ["Ejecutadas", "2"],
          ["Parciales", "1"],
          ["Canceladas", "1"],
          ["Fees", "10.78 USDT"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-3 py-2 text-xs">
            <p className="text-muted-foreground">{label}</p>
            <p className="text-lg font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {orderHistory.map((order) => (
          <div key={order.id} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] md:items-center">
            <span className="font-black text-foreground">{order.id}</span>
            <span className="text-muted-foreground">{order.pair}</span>
            <span className="text-muted-foreground">{order.side}</span>
            <span className="text-muted-foreground">{order.amount} · {order.price}</span>
            <span className="text-muted-foreground">{order.time} · fee {order.fee}</span>
            <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground">{order.status}</span>
          </div>
        ))}
      </div>
    </SpotMarketCard>
  )
}
