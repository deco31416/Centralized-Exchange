import Link from "next/link"
import { ArrowRight, MapPin, ShieldCheck, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { redDecoLocations } from "./red-deco-data"

export function RedDecoP2PCallout() {
  const nearbyAllies = redDecoLocations.slice(0, 2)

  return (
    <Card className="overflow-hidden border-border bg-card/90">
      <CardContent className="p-4 md:p-5">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <MapPin className="h-4 w-4" />
              Red Deco · P2P presencial
            </div>
            <h3 className="mt-2 text-2xl font-black text-foreground">Operadores cercanos para efectivo</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Cuando una operacion P2P necesita efectivo, remesa o apoyo presencial, Red Deco muestra aliados
              verificados por zona, horario, limite y nivel.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link href="/bolsillito/red-deco/nearby">
                  Ver aliados cercanos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/earn/aliado-deco">Operar como aliado</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {nearbyAllies.map((ally) => (
              <article key={ally.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                        {ally.riskLabel}
                      </span>
                      <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                        {ally.status}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-black text-foreground">{ally.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ally.zone} · {ally.distance}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      {ally.limit}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
