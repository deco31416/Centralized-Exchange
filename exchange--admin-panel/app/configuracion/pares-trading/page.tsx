"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TradingPairsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Pares de trading"
      description="Catálogo de pares, estados operativos, reglas de mercado y disponibilidad por producto."
      state="pending"
      percent={10}
      note="Pendiente conectar asset registry, pricing y motor de trading por gateway admin."
      scopes={[
        { title: "Pares", description: "Fiat, crypto, stablecoins, P2P y conversiones." },
        { title: "Mercado", description: "Estado, límites, spreads, precisión y liquidez." },
        { title: "Control", description: "Altas, bajas, auditoría y aprobación de cambios." },
      ]}
    />
  )
}
