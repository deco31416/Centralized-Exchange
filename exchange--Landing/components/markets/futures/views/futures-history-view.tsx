"use client"

import { futuresHistory } from "../futures-market-data"
import { FuturesMarketCard } from "../futures-market-card"

export function FuturesHistoryView() {
  return (
    <FuturesMarketCard>
      <h2 className="text-xl font-black text-foreground">Historial futuros</h2>
      <p className="mt-1 text-sm text-muted-foreground">Órdenes, fills, fees y eventos de ejecución.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {[
          ["Ejecutadas", "2"],
          ["Canceladas", "1"],
          ["Fees", "13.15 USDT"],
          ["Funding neto", "+4.22 USDT"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-3 py-2 text-xs">
            <p className="text-muted-foreground">{label}</p>
            <p className="text-lg font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {futuresHistory.map((order) => (
          <div key={order.id} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] md:items-center">
            <span className="font-black text-foreground">{order.id}</span>
            <span className="text-muted-foreground">{order.pair}</span>
            <span className="text-muted-foreground">{order.side} · {order.type}</span>
            <span className="text-muted-foreground">{order.size} · {order.price}</span>
            <span className="text-muted-foreground">{order.time} · fee {order.fee}</span>
            <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground">{order.status}</span>
          </div>
        ))}
      </div>
    </FuturesMarketCard>
  )
}
