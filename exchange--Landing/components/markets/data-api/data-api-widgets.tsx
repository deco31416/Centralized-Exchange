"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DataApiCard } from "./data-api-card"
import {
  apiKeys,
  dataApiStats,
  endpointRows,
  gatewayContracts,
  permissionGroups,
  requestLogs,
  type DataApiEndpoint,
  type DataApiLog,
  type DataApiStat,
} from "./data-api-data"

export function DataApiStatsGrid({ stats = dataApiStats }: { stats?: DataApiStat[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <DataApiCard key={stat.label} className="p-4">
          <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.detail}</p>
        </DataApiCard>
      ))}
    </div>
  )
}

export function ApiKeysPanel({ compact = false }: { compact?: boolean }) {
  const rows = compact ? apiKeys.slice(0, 2) : apiKeys

  return (
    <DataApiCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">API keys</h3>
        <Button className="rounded-full">Crear key</Button>
      </div>
      <div className="mt-4 grid gap-2">
        {rows.map((key) => (
          <div key={key.name} className="rounded-xl border border-border bg-background p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{key.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{key.key}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-black", key.status === "Activa" ? "bg-emerald-500 text-white" : "border border-border text-foreground")}>{key.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{key.scope}</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{key.lastUsed}</span>
            </div>
          </div>
        ))}
      </div>
    </DataApiCard>
  )
}

export function PermissionsPanel() {
  return (
    <DataApiCard>
      <h3 className="text-lg font-black text-foreground">Permisos</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {permissionGroups.map((permission) => (
          <div key={permission.scope} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{permission.title}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{permission.scope}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{permission.status}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{permission.detail}</p>
          </div>
        ))}
      </div>
    </DataApiCard>
  )
}

export function EndpointsPanel({ compact = false, endpoints = endpointRows }: { compact?: boolean; endpoints?: DataApiEndpoint[] }) {
  const rows = compact ? endpoints.slice(0, 4) : endpoints

  return (
    <DataApiCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-foreground">Endpoints</h3>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">{endpoints.length} rutas</span>
      </div>
      <div className="mt-4 grid gap-2">
        {rows.map((endpoint) => (
          <div key={`${endpoint.method}-${endpoint.path}`} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm xl:grid-cols-[80px_1fr_1fr_auto] xl:items-center">
            <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-black", endpoint.method === "GET" ? "bg-emerald-500 text-white" : "bg-foreground text-background")}>{endpoint.method}</span>
            <span className="font-mono text-xs font-bold text-foreground">{endpoint.path}</span>
            <span className="text-muted-foreground">{endpoint.detail}</span>
            <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{endpoint.status} · {endpoint.latency}</span>
          </div>
        ))}
      </div>
    </DataApiCard>
  )
}

export function RequestLogsPanel({ logs = requestLogs }: { logs?: DataApiLog[] }) {
  return (
    <DataApiCard>
      <h3 className="text-lg font-black text-foreground">Logs recientes</h3>
      <div className="mt-4 grid gap-2">
        {logs.map((log) => (
          <div key={log.id} className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm lg:grid-cols-[1fr_70px_1fr_auto] lg:items-center">
            <div>
              <p className="font-black text-foreground">{log.id}</p>
              <p className="text-xs text-muted-foreground">{log.time} · {log.latency}</p>
            </div>
            <span className="font-bold text-foreground">{log.method}</span>
            <span className="truncate font-mono text-xs text-muted-foreground">{log.path}</span>
            <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-black", log.status.startsWith("2") ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>{log.status}</span>
          </div>
        ))}
      </div>
    </DataApiCard>
  )
}

export function GatewayContractsPanel() {
  return (
    <DataApiCard>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Backend / Gateway</p>
      <h3 className="mt-1 text-xl font-black text-foreground">Contratos para conectar después</h3>
      <div className="mt-4 grid gap-3">
        {gatewayContracts.map((contract) => (
          <div key={contract.title} className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="font-black text-foreground">{contract.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{contract.detail}</p>
          </div>
        ))}
      </div>
    </DataApiCard>
  )
}
