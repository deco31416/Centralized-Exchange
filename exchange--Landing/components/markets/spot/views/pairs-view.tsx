"use client"

import { marketPairs, type SpotMarketPair } from "../spot-market-data"
import { SpotMarketCard } from "../spot-market-card"
import { MarketPairsPanel } from "../spot-market-widgets"

export function PairsView({ pairs = marketPairs }: { pairs?: SpotMarketPair[] }) {
  const decoPairs = pairs.filter((pair) => pair.provider === "Deco Chart").length

  return (
    <div className="space-y-5">
      <SpotMarketCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mercados spot</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Pares disponibles</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Pares publicos con TradingView y tokens del ecosistema con grafica Deco cuando no exista cobertura externa.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-muted-foreground">Total</p>
              <p className="text-lg font-black text-foreground">{pairs.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-muted-foreground">Deco</p>
              <p className="text-lg font-black text-foreground">{decoPairs}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-muted-foreground">Favoritos</p>
              <p className="text-lg font-black text-foreground">{pairs.filter((pair) => pair.favorite).length}</p>
            </div>
          </div>
        </div>
      </SpotMarketCard>

      <MarketPairsPanel pairs={pairs} />
    </div>
  )
}
