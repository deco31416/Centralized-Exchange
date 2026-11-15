"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { MarketMakerCard } from "../market-maker-card"
import { myOffers } from "../market-maker-data"
import { CreateOfferModal } from "../modals/create-offer-modal"

export function OffersView() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-5">
      <MarketMakerCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground">Mis Ofertas OTC</h2>
            <p className="text-sm text-muted-foreground">Activa cupos OTC para compradores grandes.</p>
          </div>
          <Button className="rounded-full" onClick={() => setOpen(true)}>Crear oferta</Button>
        </div>
      </MarketMakerCard>

      <div className="grid gap-2 md:grid-cols-2">
        {myOffers.map((offer) => (
          <MarketMakerCard key={offer.id} className="p-4 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-foreground">{offer.side} {offer.asset}</p>
                <p className="text-xs text-muted-foreground">{offer.country} · mínimo {offer.minTicket}</p>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground">{offer.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Cupo</p>
                <p className="font-black text-foreground">{offer.available}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Spread</p>
                <p className="font-black text-foreground">{offer.spread}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Liquidación</p>
                <p className="font-black text-foreground">{offer.settlement}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-full">Editar</Button>
              <Button variant="outline" size="sm" className="rounded-full">Pausar</Button>
            </div>
          </MarketMakerCard>
        ))}
      </div>

      <CreateOfferModal open={open} onOpenChange={setOpen} />
    </div>
  )
}
