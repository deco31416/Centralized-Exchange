import { IconActivity, IconRoute } from "@tabler/icons-react"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  adminModuleStatuses,
  getConnectionSummary,
  getMicroserviceSummary,
  type MicroserviceBuildStatus,
} from "@/lib/admin-module-status"

const microStatusLabel: Record<MicroserviceBuildStatus, string> = {
  gateway_connected: "Conectado",
  gateway_pending: "Por conectar",
  created: "Creado",
  missing: "Falta crear",
}

const microStatusClass: Record<MicroserviceBuildStatus, string> = {
  gateway_connected: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  gateway_pending: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  created: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  missing: "border-muted-foreground/20 bg-muted text-muted-foreground",
}

export function ConnectionOverview() {
  const summary = getConnectionSummary()
  const microSummary = getMicroserviceSummary()

  return (
    <Card className="border bg-card/90">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Mapa de integración
            </p>
            <CardTitle className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Conexiones por Gateway Admin
            </CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Vista interna del avance por dominio operativo. El detalle técnico de rutas queda fuera de la experiencia principal.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-semibold">
            <IconActivity className="size-4 text-primary" />
            {summary.average}% promedio
          </div>
        </div>
        <div className="grid gap-2 text-xs font-semibold md:grid-cols-4">
          <div className="rounded-full border bg-background/65 px-3 py-2">
            {microSummary.connected} conectados
          </div>
          <div className="rounded-full border bg-background/65 px-3 py-2">
            {microSummary.created} creados
          </div>
          <div className="rounded-full border bg-background/65 px-3 py-2">
            {microSummary.gatewayPending} por conectar
          </div>
          <div className="rounded-full border bg-background/65 px-3 py-2">
            {microSummary.missing} por crear
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {adminModuleStatuses.map((item) => (
            <div
              key={item.name}
              className="rounded-[1.25rem] border bg-background/55 p-4 shadow-[0_16px_45px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background/80">
                  <IconRoute className="size-5 text-primary" />
                </div>
                <ConnectionStatusBadge state={item.state} percent={item.percent} />
              </div>
              <h3 className="mt-4 text-base font-bold">{item.name}</h3>
              <p className="mt-2 min-h-[3rem] text-sm leading-5 text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-4 space-y-2">
                {item.microservices.map((micro) => (
                  <div key={`${item.name}-${micro.repo}`} className="rounded-2xl border bg-card/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold">{micro.name}</p>
                        <p className="text-xs text-muted-foreground">{micro.repo}</p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${microStatusClass[micro.status]}`}
                      >
                        {microStatusLabel[micro.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{micro.nextStep}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span>{item.gateway}</span>
                <span>{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
