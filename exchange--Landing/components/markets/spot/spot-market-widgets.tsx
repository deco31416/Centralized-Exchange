"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketChart } from "../market-chart"
import {
  marketPairs,
  openOrders,
  orderBook as fallbackOrderBook,
  recentTrades as fallbackRecentTrades,
  type SpotMarketPair,
  type SpotOrderBookDisplay,
  type SpotTradeDisplay,
} from "./spot-market-data"
import { SpotMarketCard } from "./spot-market-card"

export function SpotChartPanel({ compact = false, pair = marketPairs[0] }: { compact?: boolean; pair?: SpotMarketPair }) {
  return <MarketChart pair={pair} compact={compact} />
}

export function OrderBookPanel({ data = fallbackOrderBook, midPrice = "67,420.50" }: { data?: SpotOrderBookDisplay; midPrice?: string }) {
  return (
    <SpotMarketCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Libro de órdenes</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">0.02% spread</span>
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
    </SpotMarketCard>
  )
}

export function RecentTradesPanel({ trades = fallbackRecentTrades }: { trades?: SpotTradeDisplay[] }) {
  return (
    <SpotMarketCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Trades recientes</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">Tiempo real</span>
      </div>
      <div className="mt-4 space-y-2 text-xs">
        {trades.map((trade) => (
          <div key={`${trade.time}-${trade.amount}`} className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <span className={trade.side === "buy" ? "text-emerald-500" : "text-red-500"}>{trade.price}</span>
            <span className="text-muted-foreground">{trade.amount}</span>
            <span className="text-right text-muted-foreground">{trade.time}</span>
          </div>
        ))}
      </div>
    </SpotMarketCard>
  )
}

export function SpotOrderForm() {
  return (
    <SpotMarketCard>
      <div className="flex rounded-full border border-border bg-background p-1 text-sm font-bold">
        <button className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-white">Comprar</button>
        <button className="flex-1 rounded-full px-4 py-2 text-muted-foreground">Vender</button>
      </div>
      <div className="mt-4 flex rounded-full border border-border bg-background p-1 text-xs font-bold">
        {["Limit", "Market", "Stop"].map((type) => (
          <button key={type} className={cn("flex-1 rounded-full px-3 py-2 text-muted-foreground", type === "Limit" && "bg-foreground text-background")}>{type}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {[
          ["Tipo", "Limit"],
          ["Precio", "67,420.50 USDT"],
          ["Cantidad", "0.10 BTC"],
          ["Total", "6,742.05 USDT"],
        ].map(([label, value]) => (
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
      <div className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Disponible</span>
          <span className="font-black text-foreground">8,420.00 USDT</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-muted-foreground">Fee estimado</span>
          <span className="font-black text-foreground">0.10%</span>
        </div>
      </div>
      <Button className="mt-4 w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-500/90">Enviar orden</Button>
    </SpotMarketCard>
  )
}

export function MarketPairsPanel({ favoritesOnly = false, dense = false, pairs: pairList = marketPairs }: { favoritesOnly?: boolean; dense?: boolean; pairs?: SpotMarketPair[] }) {
  const pairs = favoritesOnly ? pairList.filter((pair) => pair.favorite) : pairList

  return (
    <SpotMarketCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">{favoritesOnly ? "Favoritos" : "Pares spot"}</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{pairs.length} pares</span>
      </div>
      <div className="mt-4 grid gap-2">
        {pairs.map((pair) => (
          <div key={pair.pair} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-sm">
            <div>
              <p className="font-black text-foreground">{pair.pair}</p>
              <p className="text-xs text-muted-foreground">Vol {pair.volume} · {pair.provider}</p>
            </div>
            <span className="font-bold text-foreground">{pair.price}</span>
            <span className={cn("text-xs font-black", pair.change.startsWith("+") ? "text-emerald-500" : "text-red-500")}>{pair.change}</span>
            {!dense && (
              <div className="col-span-3 flex flex-wrap gap-2 border-t border-border pt-2">
                <span className="rounded-full border border-border px-2 py-1 text-[11px] font-bold text-muted-foreground">{pair.market}</span>
                <span className="rounded-full border border-border px-2 py-1 text-[11px] font-bold text-muted-foreground">{pair.favorite ? "Favorito" : "Disponible"}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </SpotMarketCard>
  )
}

export function OpenOrdersPanel() {
  return (
    <SpotMarketCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Órdenes abiertas</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{openOrders.length} activas</span>
      </div>
      <div className="mt-4 grid gap-2">
        {openOrders.map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-background p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-foreground">{order.pair}</p>
              <div className="flex gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{order.type}</span>
                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">{order.status}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              <span className="text-muted-foreground">Lado<br /><b className="text-foreground">{order.side}</b></span>
              <span className="text-muted-foreground">Precio<br /><b className="text-foreground">{order.price}</b></span>
              <span className="text-muted-foreground">Cantidad<br /><b className="text-foreground">{order.amount}</b></span>
              <span className="text-muted-foreground">Fill<br /><b className="text-foreground">{order.filled}</b></span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">Creada {order.time}</span>
              <button className="font-bold text-foreground">Cancelar</button>
            </div>
          </div>
        ))}
      </div>
    </SpotMarketCard>
  )
}
