"use client"

import type { DataApiLog } from "../data-api-data"
import { DataApiCard } from "../data-api-card"
import { RequestLogsPanel } from "../data-api-widgets"

export function DataApiLogsView({ logs }: { logs?: DataApiLog[] }) {
  return (
    <div className="space-y-5">
      <DataApiCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Observabilidad</p>
        <h2 className="mt-1 text-2xl font-black text-foreground">Logs de requests</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Auditoría de llamadas para medir errores, latencia, consumo de cuota y fallos de autenticación.
        </p>
      </DataApiCard>
      <RequestLogsPanel logs={logs} />
    </div>
  )
}
