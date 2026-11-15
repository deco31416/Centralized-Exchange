"use client"

import {
  IconAlertTriangle,
  IconBinaryTree,
  IconChartDots,
  IconDatabaseDollar,
  IconRefreshAlert,
  IconShieldCheck,
} from "@tabler/icons-react"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { CryptoFlowActionsPanel } from "./crypto-flow-actions-panel"
import { CryptoFlowAuditItem, CryptoFlowStatus, useCryptoFlowsAudit } from "./use-crypto-flows-audit"

function amount(value: number, asset = "USD") {
  return `${new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: asset === "USDT" ? 2 : 8,
  }).format(value || 0)} ${asset}`
}

function compactHash(hash: string) {
  if (!hash) return "—"
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

function statusLabel(status?: CryptoFlowStatus) {
  if (status === "matched") return "Conciliado"
  if (status === "blocked") return "Bloqueado"
  return "En revisión"
}

function statusClass(status?: CryptoFlowStatus) {
  if (status === "matched") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
  if (status === "blocked") return "bg-rose-500/15 text-rose-700 dark:text-rose-300"
  return "bg-amber-500/15 text-amber-700 dark:text-amber-300"
}

function typeLabel(type: CryptoFlowAuditItem["type"]) {
  if (type === "deposit") return "Depósito"
  if (type === "withdrawal") return "Retiro"
  return "Barrido"
}

const integrationPlan = [
  {
    title: "Indexadores reales por red",
    status: "Pendiente",
    description: "BTC, Ethereum, Tron, Solana y redes habilitadas por custodia.",
  },
  {
    title: "Ledger y custodia",
    status: "Siguiente",
    description: "Cruzar hash, asiento contable, hot/cold wallet y usuario final.",
  },
  {
    title: "Barridos y fees",
    status: "Siguiente",
    description: "Separar fee de red, sweeping, diferencia operativa y proveedor.",
  },
  {
    title: "Riesgo blockchain",
    status: "Pendiente",
    description: "Conectar KYC/Risk, sanciones, OSINT y reputación de direcciones.",
  },
  {
    title: "Evidencias exportables",
    status: "Pendiente",
    description: "Guardar hash, bloque, confirmaciones, fuente/indexador y responsable.",
  },
  {
    title: "Acciones auditadas",
    status: "Parcial",
    description: "Bitácora lista; ejecución real queda pendiente contra custodia y límites.",
  },
]

export function CryptoFlowsAuditPage() {
  const {
    summary,
    alerts,
    controls,
    reconciliation,
    actions,
    actionLoading,
    actionError,
    createAction,
    transitionAction,
    loading,
    error,
  } = useCryptoFlowsAudit()
  const connected = !error

  const stats = [
    {
      title: "Flujos auditados",
      value: loading ? "—" : summary.flows,
      change: { value: 0, label: "on-chain", isPositive: true },
      icon: <IconBinaryTree className="size-5" />,
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
      change: { value: 0, label: "riesgo", isPositive: summary.review === 0 },
      icon: <IconRefreshAlert className="size-5" />,
    },
    {
      title: "Redes",
      value: loading ? "—" : summary.networks,
      change: { value: 0, label: "monitoreadas", isPositive: true },
      icon: <IconChartDots className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Flujos crypto"
        description="Auditoría de depósitos, retiros, hashes, confirmaciones, barridos y relación con custodia."
        state={connected ? "partial" : "pending"}
        percent={connected ? 42 : 20}
        note={
          connected
            ? "Lectura inicial conectada por BFF y Gateway Admin hacia audit-crypto-flows; indexadores reales y evidencias quedan para fase auditada."
            : error ?? "No se pudo consultar audit-crypto-flows."
        }
      />

      <StatsCards stats={stats} />

      <div className="grid gap-4 @4xl/page:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.5rem]">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Conciliación on-chain</CardTitle>
              <CardDescription>
                Cruce entre red, hash, wallet, ledger y diferencias por fee o barrido.
              </CardDescription>
            </div>
            <ConnectionStatusBadge state={connected ? "partial" : "pending"} percent={connected ? 42 : 20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                Cargando auditoría de flujos crypto desde Gateway Admin...
              </div>
            ) : reconciliation.length ? (
              <div className="grid gap-3">
                {reconciliation.map((item) => (
                  <div key={item.id} className="rounded-[1.25rem] border bg-card/70 p-4 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{item.asset}</p>
                          <Badge variant="outline" className="rounded-full">
                            {typeLabel(item.type)}
                          </Badge>
                          <Badge className={cn("rounded-full", statusClass(item.status))}>
                            {statusLabel(item.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.network} · {item.walletClass} · {compactHash(item.txHash)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold tabular-nums">
                          {amount(item.onChainAmount, item.asset)}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.confirmations} confirmaciones</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <span>Ledger: {amount(item.expectedAmount, item.asset)}</span>
                      <span>Diferencia: {amount(item.difference, item.asset)}</span>
                      <span>{item.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
                No hay flujos crypto auditados todavía.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
                <IconDatabaseDollar className="size-6 text-primary" />
              </div>
              <CardTitle>Controles</CardTitle>
              <CardDescription>Reglas sobre dinero real en blockchain y su reflejo en ledger.</CardDescription>
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
              <CardDescription>Confirmaciones, barridos y señales de riesgo que requieren revisión.</CardDescription>
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

      <CryptoFlowActionsPanel
        flows={reconciliation}
        actions={actions}
        loading={actionLoading}
        error={actionError}
        onCreate={createAction}
        onTransition={transitionAction}
      />

      <Card className="rounded-[1.5rem]">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Bitácora de integración</CardTitle>
            <CardDescription>
              Memoria operativa para llevar esta vista de lectura inicial a auditoría productiva.
            </CardDescription>
          </div>
          <ConnectionStatusBadge state="partial" percent={42} />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {integrationPlan.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border bg-card/70 p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  <Badge variant="outline" className="shrink-0 rounded-full">
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Regla de arquitectura: Admin Panel consulta BFF interno, el BFF pasa por Gateway Admin y el
            Gateway Admin gobierna el microservicio. No se conectan vistas administrativas directo a
            microservicios.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
