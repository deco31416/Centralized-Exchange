"use client"

import { FuturesMarketCard } from "../futures-market-card"
import { RiskPanel } from "../futures-market-widgets"

export function FuturesRiskView() {
  return (
    <div className="space-y-5">
      <RiskPanel />
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          ["Regla de margen", "Reducir exposición si margen usado supera 65%."],
          ["Liquidación", "Alertar si una posición queda a menos de 4%."],
          ["Funding", "Mostrar costo estimado antes de mantener posición."],
        ].map(([title, description]) => (
          <FuturesMarketCard key={title}>
            <h3 className="text-lg font-black text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </FuturesMarketCard>
        ))}
      </div>
    </div>
  )
}
