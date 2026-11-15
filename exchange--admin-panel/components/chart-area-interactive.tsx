"use client"

import {
  IconChartBar,
  IconCircleCheck,
  IconDatabase,
  IconPlugConnected,
  IconTimeline,
  IconWifiOff,
} from "@tabler/icons-react"

import { useAdminAnalytics } from "@/components/admin-analytics/use-admin-analytics"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const analyticsScopes = [
  {
    title: "Series históricas",
    description: "Usuarios, operaciones, volumen y actividad por rango de tiempo.",
    Icon: IconTimeline,
  },
  {
    title: "Eventos operativos",
    description: "Actividad de gateway, micros, admins y módulos críticos.",
    Icon: IconPlugConnected,
  },
  {
    title: "Agregados reales",
    description: "Métricas calculadas desde auth, ledger, P2P y KYC/riesgo.",
    Icon: IconDatabase,
  },
]

export const description = "Estado de conexión de analítica administrativa"

export function ChartAreaInteractive() {
  const { overview, loading, error, state } = useAdminAnalytics("30d")
  const connectionState = state === "connected" ? "connected" : state === "connected_empty" ? "partial" : "pending"
  const percent = state === "connected" ? overview?.dataCompleteness ?? 100 : state === "connected_empty" ? 15 : 0

  return (
    <Card className="@container/card rounded-[1.5rem]">
      <CardHeader>
        <div className="space-y-1.5">
          <CardTitle>Actividad del panel</CardTitle>
          <CardDescription>
            Analítica administrativa conectada por Gateway Admin.
          </CardDescription>
        </div>
        <CardAction>
          <ConnectionStatusBadge state={connectionState} percent={percent} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="rounded-[1.5rem] border bg-muted/20 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconChartBar className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                {loading
                  ? "Leyendo analítica administrativa"
                  : error
                    ? "Admin Analytics sin respuesta"
                    : "Admin Analytics conectado"}
              </h3>
              <p className="mt-2 leading-6 text-muted-foreground">
                {error
                  ? "Revisa que el gateway admin y el micro admin-analytics estén activos."
                  : "El micro ya responde estructura operativa. Las series quedan en cero hasta ingerir eventos reales del ecosistema."}
              </p>
              {overview ? (
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <span>Rango: {overview.range}</span>
                  <span>Fuente: {overview.source === "empty" ? "sin eventos" : "agregada"}</span>
                  <span>Operaciones: {overview.totals.operations.toLocaleString()}</span>
                  <span>Volumen USD: {overview.totals.volumeUsd.toLocaleString()}</span>
                </div>
              ) : null}
              {overview?.sources?.length ? (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {overview.sources.map((source) => {
                    const connected = source.status === "connected"
                    const Icon = connected ? IconCircleCheck : IconWifiOff

                    return (
                      <div
                        key={source.key}
                        className="flex items-center justify-between gap-3 rounded-full border bg-background/70 px-3 py-2 text-xs"
                      >
                        <span className="truncate font-medium">{source.label}</span>
                        <span
                          className={
                            connected
                              ? "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300"
                              : "inline-flex items-center gap-1 text-muted-foreground"
                          }
                        >
                          <Icon className="size-3.5" />
                          {connected ? "Conectado" : "Sin respuesta"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[52%]">
              {analyticsScopes.map(({ title, description, Icon }) => (
                <div key={title} className="rounded-[1.25rem] border bg-card p-4">
                  <Icon className="mb-3 size-5 text-primary" />
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
