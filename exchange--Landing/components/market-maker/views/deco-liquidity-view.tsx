"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { MarketMakerCard } from "../market-maker-card"
import { decoProposal } from "../market-maker-data"
import { DecoLiquidityModal } from "../modals/deco-liquidity-modal"

export function DecoLiquidityView() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-5">
      <MarketMakerCard>
        <h2 className="text-xl font-black text-foreground">Cupo preferencial para Deco</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Reserva liquidez para la mesa Deco con precio preferencial. Ejemplo: ofreces USDT a +1%, Deco distribuye a +3% y conserva 2% de margen.
        </p>
      </MarketMakerCard>

      <MarketMakerCard>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Activo", decoProposal.asset],
            ["Cupo ofrecido", decoProposal.amount],
            ["Precio para Deco", decoProposal.makerRate],
            ["Precio comercial", decoProposal.decoTarget],
            ["Margen esperado", decoProposal.decoMargin],
            ["Liquidación", decoProposal.settlement],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-black text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <Button className="mt-5 rounded-full" onClick={() => setOpen(true)}>Ofrecer cupo</Button>
      </MarketMakerCard>

      <DecoLiquidityModal open={open} onOpenChange={setOpen} />
    </div>
  )
}
