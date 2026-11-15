"use client"

import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCashBanknote,
  IconReceiptDollar,
  IconRefreshAlert,
  IconShieldCheck,
} from "@tabler/icons-react"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { FiatFlowAuditItem, FiatFlowStatus, useFiatFlowsAudit } from "./use-fiat-flows-audit"

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function statusLabel(status?: FiatFlowStatus) {
  if (status === "matched") return "Conciliado"
  if (status === "blocked") return "Bloqueado"
  return "En revisión"
}

function statusClass(status?: FiatFlowStatus) {
  if (status === "matched") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
  if (status === "blocked") return "bg-rose-500/15 text-rose-700 dark:text-rose-300"
  return "bg-amber-500/15 text-amber-700 dark:text-amber-300"
}

function typeLabel(type: FiatFlowAuditItem["type"]) {
  if (type === "deposit") return "Depósito"
  if (type === "withdrawal") return "Retiro"
  if (type === "remittance") return "Remesa"
  return "Pago comercio"
}

export function FiatFlowsAuditPage() {
  const { summary, alerts, controls, reconciliation, loading, error } = useFiatFlowsAudit()
  const connected = !error

  const stats = [
    {
      title: "Flujos auditados",
      value: loading ? "—" : summary.flows,
      change: { value: 0, label: "fiat", isPositive: true },
      icon: <IconCashBanknote className="size-5" />,
    },
    {
      title: "Conciliados",
      value: loading ? "—" : summary.matched,
      change: { value: 0, label: "ledger", isPositive: true },
      icon: <IconShieldCheck className="size-5" />,
    },
    {
      title: "En revisión",
      value: loading ? "—" : summary.review,
      change: { value: 0, label: "operación", isPositive: summary.review === 0 },
      icon: <IconRefreshAlert className="size-5" />,
    },
    {
      title: "Diferencia",
      value: loading ? "—" : money(summary.totalDifference, "USD"),
      change: { value: 0, label: "multi-moneda", isPositive: summary.totalDifference === 0 },
      icon: <IconReceiptDollar className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Flujos fiat"
        description="Auditoría de depósitos, retiros, remesas, pagos, fees externos y conciliación bancaria."
        state={connected ? "partial" : "pending"}
        percent={connected ? 42 : 20}
        note={
          connected
            ? "Lectura inicial conectada por BFF y Gateway Admin hacia audit-fiat-flows; conciliación real por proveedor queda para la fase auditada."
            : error ?? "No se pudo consultar audit-fiat-flows."
        }
      />

      <StatsCards stats={stats} />

      <div className="grid gap-4 @4xl/page:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.5rem]">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Conciliación de movimientos</CardTitle>
              <CardDescription>
                Cruce operativo entre proveedor fiat, pasarela, ledger y diferencias por fee o liquidación.
              </CardDescription>
            </div>
            <ConnectionStatusBadge state={connected ? "partial" : "pending"} percent={connected ? 42 : 20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                Cargando auditoría de flujos fiat desde Gateway Admin...
              </div>
            ) : reconciliation.length ? (
              <div className="grid gap-3">
                {reconciliation.map((item) => (
                  <div key={item.id} className="rounded-[1.25rem] border bg-card/70 p-4 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{item.provider}</p>
                          <Badge variant="outline" className="rounded-full">
                            {typeLabel(item.type)}
                          </Badge>
                          <Badge className={cn("rounded-full", statusClass(item.status))}>
                            {statusLabel(item.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.rail} · {item.currency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold tabular-nums">
                          {money(item.providerAmount, item.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">proveedor</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <span>Ledger: {money(item.expectedAmount, item.currency)}</span>
                      <span>Diferencia: {money(item.difference, item.currency)}</span>
                      <span>{item.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                No hay flujos fiat auditados todavía.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconBuildingBank className="size-6 text-primary" />
              </div>
              <CardTitle>Controles</CardTitle>
              <CardDescription>Reglas que gobiernan dinero fiat real retenido en pasarelas y bancos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {controls.map((control) => (
                <div key={control.id} className="rounded-[1rem] border p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{control.name}</span>
                    <Badge className={cn("rounded-full", statusClass(control.status))}>
                      {statusLabel(control.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{control.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconAlertTriangle className="size-6 text-primary" />
              </div>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>Diferencias y señales que requieren revisión operativa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-[1rem] border p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{alert.title}</span>
                      <Badge variant="outline" className="rounded-full">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">{alert.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin alertas abiertas.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
