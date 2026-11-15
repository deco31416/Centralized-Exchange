"use client"

import { Button } from "@/components/ui/button"
import type { DataApiEndpoint, DataApiLog, DataApiStat, DataApiView } from "../data-api-data"
import { DataApiCard } from "../data-api-card"
import { ApiKeysPanel, DataApiStatsGrid, EndpointsPanel, GatewayContractsPanel, RequestLogsPanel } from "../data-api-widgets"

export function DataApiSummaryView({
  onNavigate,
  stats,
  endpoints,
  logs,
  dataSource = "fallback",
}: {
  onNavigate: (view: DataApiView) => void
  stats?: DataApiStat[]
  endpoints?: DataApiEndpoint[]
  logs?: DataApiLog[]
  dataSource?: "backend" | "fallback"
}) {
  return (
    <div className="space-y-5">
      <DataApiStatsGrid stats={stats} />

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          <DataApiCard>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Consola API</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">Datos de mercado listos para integrar</h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  Administra keys, permisos, endpoints y logs para conectar dashboards, bots o el gateway de usuario.
                </p>
                <p className="mt-2 text-xs font-bold text-muted-foreground">
                  Datos {dataSource === "backend" ? "desde backend" : "desde fallback BFF"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-full" onClick={() => onNavigate("keys")}>Crear key</Button>
                <Button variant="outline" className="rounded-full" onClick={() => onNavigate("endpoints")}>Ver endpoints</Button>
              </div>
            </div>
          </DataApiCard>
          <EndpointsPanel compact endpoints={endpoints} />
        </div>
        <div className="space-y-5">
          <GatewayContractsPanel />
          <ApiKeysPanel compact />
        </div>
      </div>

      <RequestLogsPanel logs={logs} />
    </div>
  )
}
