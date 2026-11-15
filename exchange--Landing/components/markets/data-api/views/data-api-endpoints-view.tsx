"use client"

import type { DataApiEndpoint } from "../data-api-data"
import { DataApiCard } from "../data-api-card"
import { EndpointsPanel } from "../data-api-widgets"

export function DataApiEndpointsView({ endpoints }: { endpoints?: DataApiEndpoint[] }) {
  return (
    <div className="space-y-5">
      <DataApiCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Contratos</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Endpoints de mercado y usuario</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Rutas BFF para ticker, candles, order book y trades. Órdenes y alertas quedan para gateway autenticado.
        </p>
      </DataApiCard>
      <EndpointsPanel endpoints={endpoints} />
    </div>
  )
}
