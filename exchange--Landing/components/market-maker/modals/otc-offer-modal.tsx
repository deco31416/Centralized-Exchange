"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { OtcOffer } from "../market-maker-data"

type OtcOfferModalProps = {
  offer: OtcOffer | null
  onOpenChange: (open: boolean) => void
}

export function OtcOfferModal({ offer, onOpenChange }: OtcOfferModalProps) {
  return (
    <Dialog open={Boolean(offer)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 dark:bg-background">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black">
              {offer ? `${offer.side} ${offer.asset}` : "Oferta OTC"}
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-muted-foreground">{offer?.maker} · {offer?.country}</p>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
          {offer && [
            ["Disponible", `${offer.available} ${offer.asset}`],
            ["Spread", offer.spread],
            ["Ticket mínimo", offer.minTicket],
            ["Respuesta", offer.responseTime],
            ["Liquidación", offer.settlement ?? "T+0 / T+1"],
            ["Canal", offer.rail ?? "Bancario"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-bold text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-black text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button className="rounded-full px-7" onClick={() => onOpenChange(false)}>
            Contactar mesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
