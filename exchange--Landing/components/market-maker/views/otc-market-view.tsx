"use client"

import { Search } from "lucide-react"
import * as React from "react"
import { MarketMakerCard } from "../market-maker-card"
import { otcOffers, type OtcOffer } from "../market-maker-data"
import { OtcOfferModal } from "../modals/otc-offer-modal"

export function OtcMarketView() {
  const [query, setQuery] = React.useState("")
  const [selectedOffer, setSelectedOffer] = React.useState<OtcOffer | null>(null)
  const filtered = otcOffers.filter((offer) => {
    const q = query.trim().toLowerCase()
    return !q || offer.asset.toLowerCase().includes(q) || offer.country.toLowerCase().includes(q) || offer.maker.toLowerCase().includes(q)
  })

  return (
    <MarketMakerCard>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Mercado OTC</h2>
          <p className="text-sm text-muted-foreground">Cupos mayoristas publicados por mesas verificadas.</p>
        </div>
        <label className="flex h-10 w-full items-center gap-2 rounded-full border border-foreground bg-foreground px-4 text-sm text-background shadow-sm md:w-[260px]">
          <Search className="h-4 w-4 text-background/80" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar oferta"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-background/75"
          />
        </label>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((offer) => (
          <button
            key={offer.id}
            onClick={() => setSelectedOffer(offer)}
            className="relative min-h-[126px] rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-card/70"
          >
            <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary" />
            <div className="pl-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-foreground">{offer.side} {offer.asset}</p>
                  <p className="text-xs text-muted-foreground">{offer.maker} · {offer.country}</p>
                </div>
                <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">{offer.spread}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <span className="text-muted-foreground">Cupo<br /><b className="text-foreground">{offer.available}</b></span>
                <span className="text-muted-foreground">Ticket<br /><b className="text-foreground">{offer.minTicket}</b></span>
                <span className="text-muted-foreground">Respuesta<br /><b className="text-foreground">{offer.responseTime}</b></span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <OtcOfferModal offer={selectedOffer} onOpenChange={(open) => !open && setSelectedOffer(null)} />
    </MarketMakerCard>
  )
}
