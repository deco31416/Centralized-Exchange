"use client"

import { DataApiCard } from "../data-api-card"
import { GatewayContractsPanel, PermissionsPanel } from "../data-api-widgets"

export function DataApiPermissionsView() {
  return (
    <div className="space-y-5">
      <DataApiCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Permisos y seguridad</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Scopes controlados por usuario</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Separar datos públicos, cuenta y trading evita que una integración tenga más permisos de los necesarios.
        </p>
      </DataApiCard>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <PermissionsPanel />
        <GatewayContractsPanel />
      </div>
    </div>
  )
}
