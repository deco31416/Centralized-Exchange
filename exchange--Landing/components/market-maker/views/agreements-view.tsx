"use client"

import { Button } from "@/components/ui/button"
import { MarketMakerCard } from "../market-maker-card"
import { agreementRows } from "../market-maker-data"

export function AgreementsView() {
  const totalOpen = agreementRows.filter((row) => row.status !== "Liquidado" && row.status !== "Cancelado").length

  return (
    <div className="space-y-5">
      <MarketMakerCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mesa OTC</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Acuerdos comerciales</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Seguimiento de negociaciones abiertas, cupos aprobados y cierres listos para liquidar.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-muted-foreground">Abiertos</p>
              <p className="text-lg font-black text-foreground">{totalOpen}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-muted-foreground">Liquidado</p>
              <p className="text-lg font-black text-foreground">45 BTC</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-muted-foreground">Ganancia</p>
              <p className="text-lg font-black text-foreground">2%</p>
            </div>
          </div>
        </div>
      </MarketMakerCard>

      <div className="grid gap-3">
        {agreementRows.map((row) => (
          <MarketMakerCard key={row.id} className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-black text-foreground">{row.asset}</p>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{row.id}</span>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">{row.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{row.amount} disponibles · cierre {row.settlement}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs lg:w-[360px]">
                <div className="rounded-xl border border-border bg-background px-3 py-2">
                  <p className="text-muted-foreground">Mesa</p>
                  <p className="font-black text-foreground">{row.makerRate}</p>
                </div>
                <div className="rounded-xl border border-border bg-background px-3 py-2">
                  <p className="text-muted-foreground">Precio</p>
                  <p className="font-black text-foreground">{row.decoTarget}</p>
                </div>
                <div className="rounded-xl border border-border bg-background px-3 py-2">
                  <p className="text-muted-foreground">Ganancia</p>
                  <p className="font-black text-foreground">{row.margin}</p>
                </div>
              </div>

              <Button variant="outline" className="w-fit rounded-full">
                Ver detalle
              </Button>
            </div>
          </MarketMakerCard>
        ))}
      </div>
    </div>
  )
}
