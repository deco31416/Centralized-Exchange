"use client"

import { marketPairs, type SpotMarketPair } from "../spot-market-data"
import { SpotMarketCard } from "../spot-market-card"
import { MarketPairsPanel, SpotChartPanel } from "../spot-market-widgets"

export function FavoritesView({ pairs = marketPairs, activePair = marketPairs[0] }: { pairs?: SpotMarketPair[]; activePair?: SpotMarketPair }) {
  const favorites = pairs.filter((pair) => pair.favorite)

  return (
    <div className="space-y-5">
      <SpotMarketCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Watchlist</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Favoritos spot</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Sigue los pares que mas usas, incluyendo tokens del ecosistema Deco con grafica propia.
            </p>
          </div>
          <span className="w-fit rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground">
            {favorites.length} pares guardados
          </span>
        </div>
      </SpotMarketCard>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <MarketPairsPanel favoritesOnly pairs={pairs} />
        <SpotChartPanel compact pair={activePair} />
      </div>
    </div>
  )
}
