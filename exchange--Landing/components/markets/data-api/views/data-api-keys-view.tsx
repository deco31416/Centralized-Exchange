"use client"

import { DataApiCard } from "../data-api-card"
import { ApiKeysPanel, PermissionsPanel } from "../data-api-widgets"

export function DataApiKeysView() {
  return (
    <div className="space-y-5">
      <DataApiCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Credenciales</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">API keys por integración</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Cada key debe quedar ligada al usuario, país, permisos, límites y estado KYC desde el gateway.
        </p>
      </DataApiCard>
      <ApiKeysPanel />
      <PermissionsPanel />
    </div>
  )
}
