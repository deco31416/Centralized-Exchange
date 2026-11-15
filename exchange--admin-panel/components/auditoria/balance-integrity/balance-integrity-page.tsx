"use client"

import {
  IconAlertTriangle,
  IconActivity,
  IconDatabaseDollar,
  IconShieldCheck,
  IconTrendingUp,
} from "@tabler/icons-react"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { useBalanceIntegrity } from "./use-balance-integrity"

function money(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function ratio(value: number) {
  return `${(value || 0).toFixed(4)}x`
}

function statusLabel(status?: string) {
  if (status === "solvent") return "Solvente"
  if (status === "insolvent") return "Insolvente"
  return "En revisión"
}

function statusClass(status?: string) {
  if (status === "solvent") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
  if (status === "insolvent") return "bg-rose-500/15 text-rose-700 dark:text-rose-300"
  return "bg-amber-500/15 text-amber-700 dark:text-amber-300"
}

export function BalanceIntegrityPage() {
  const { summary, controls, latest, loading, error } = useBalanceIntegrity()
  const connected = !error

  const stats = [
    {
      title: "Activos reales",
      value: loading ? "—" : money(summary.assets),
      change: { value: 0, label: "custodia", isPositive: true },
      icon: <IconDatabaseDollar className="size-5" />,
    },
    {
      title: "Pasivos usuarios",
      value: loading ? "—" : money(summary.liabilities),
      change: { value: 0, label: "ledger", isPositive: true },
      icon: <IconActivity className="size-5" />,
    },
    {
      title: "Ratio solvencia",
      value: loading ? "—" : ratio(summary.ratio),
      change: { value: 0, label: "Pepsi Test", isPositive: summary.ratio >= 1 },
      icon: <IconShieldCheck className="size-5" />,
    },
    {
      title: "Alertas abiertas",
      value: loading ? "—" : summary.openAlerts,
      change: { value: 0, label: "integridad", isPositive: summary.openAlerts === 0 },
      icon: <IconAlertTriangle className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Integridad de balances"
        description="Control de solvencia entre activos reales custodiados y pasivos registrados para usuarios."
        state={connected ? "partial" : "pending"}
        percent={connected ? 42 : 20}
        note={
          connected
            ? "Lectura inicial conectada por BFF y Gateway Admin hacia audit-balance-integrity; kill switch y evidencias quedan para fase auditada."
            : error ?? "No se pudo consultar el auditor de integridad."
        }
      />

      <StatsCards stats={stats} />

      <div className="grid gap-4 @4xl/page:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[1.5rem]">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
              <IconTrendingUp className="size-6 text-primary" />
            </div>
            <CardTitle>Pepsi Test</CardTitle>
            <CardDescription>
              Comparación periódica de activos contra pasivos para detectar riesgo de insolvencia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-[1.25rem] border p-4">
              <span className="text-muted-foreground">Estado</span>
              <Badge className={cn("rounded-full", statusClass(summary.status))}>
                {statusLabel(summary.status)}
              </Badge>
            </div>
            <div className="rounded-[1.25rem] border p-4">
              <p className="text-muted-foreground">Diferencia neta</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{money(summary.difference)}</p>
            </div>
            <p className="text-muted-foreground">
              Última revisión: {latest?.checkedAt ? new Date(latest.checkedAt).toLocaleString("es-CO") : "sin ejecución"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem]">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Controles de auditoría</CardTitle>
              <CardDescription>
                Reglas de integridad que luego deben alimentarse con custodia crypto, custodia fiat y ledger.
              </CardDescription>
            </div>
            <ConnectionStatusBadge state={connected ? "partial" : "pending"} percent={connected ? 42 : 20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                Cargando controles desde Gateway Admin...
              </div>
            ) : controls.length ? (
              <div className="grid gap-3">
                {controls.map((control) => (
                  <div key={control.id} className="rounded-[1.25rem] border bg-card/70 p-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold">{control.name}</p>
                      <Badge className={cn("rounded-full", statusClass(control.status))}>
                        {statusLabel(control.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{control.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                No hay controles registrados todavía.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
