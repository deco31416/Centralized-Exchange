"use client"

import {
  IconArrowRight,
  IconCircleCheck,
  IconCircleX,
  IconGitPullRequest,
  IconHistory,
  IconRefresh,
  IconScale,
  IconShieldLock,
  IconTrafficLights,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { LimitPolicyChange, LimitPolicyChangeRequest, LimitPolicyRule } from "./types"
import { useLimitPolicies } from "./use-limit-policies"

const operationLabels: Record<string, string> = {
  DEPOSIT: "Depósito",
  WITHDRAW: "Retiro",
  BUY: "Compra",
  SELL: "Venta",
  CONVERT: "Conversión",
  P2P: "P2P",
  REMITTANCE: "Remesa",
  PAYMENT: "Pago",
  TRANSFER: "Transferencia",
}

const decisionClass = {
  ALLOW: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REVIEW: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  BLOCK: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
} as const

function formatMoney(value: number) {
  return value.toLocaleString("es-CO", {
    maximumFractionDigits: 2,
  })
}

function SummaryCard({
  title,
  value,
  label,
}: {
  title: string
  value: number
  label: string
}) {
  return (
    <div className="rounded-[1.5rem] border bg-card p-6 shadow-[0_18px_55px_rgba(15,23,42,0.10)] dark:shadow-none">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
      <p className="mt-3 text-sm font-semibold">{label}</p>
    </div>
  )
}

function LimitRuleCard({
  rule,
  onRequestEnabled,
  onRequestApproval,
}: {
  rule: LimitPolicyRule
  onRequestEnabled: (rule: LimitPolicyRule) => void
  onRequestApproval: (rule: LimitPolicyRule) => void
}) {
  return (
    <article className="rounded-[1.5rem] border bg-background/60 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:bg-black/20 dark:shadow-none">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-card">
            <IconScale className="size-5 text-[#ff6c02]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold">{rule.name}</h3>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                {operationLabels[rule.operation] ?? rule.operation}
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                {rule.assetType}
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                v{rule.version ?? 1}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {rule.product} · {rule.currency ?? "Todas las monedas"} · {rule.country ?? "Global"}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            rule.requiresApproval
              ? "w-fit rounded-full border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
              : "w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold"
          }
        >
          {rule.requiresApproval ? "Requiere aprobación" : "Automática"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xs text-muted-foreground">KYC</p>
          <p className="font-semibold">{rule.kycLevel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Riesgo</p>
          <p className="font-semibold">{rule.riskLevel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Por operación</p>
          <p className="font-semibold">{formatMoney(rule.maxAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Diario</p>
          <p className="font-semibold">{formatMoney(rule.dailyLimit)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Mensual</p>
          <p className="font-semibold">{formatMoney(rule.monthlyLimit)}</p>
        </div>
      </div>

      {rule.lastChangeReason ? (
        <p className="mt-4 rounded-[1rem] border bg-card px-4 py-3 text-sm text-muted-foreground">
          Último cambio: {rule.lastChangeReason}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onRequestEnabled(rule)}>
          {rule.enabled ? "Solicitar pausa" : "Solicitar activación"}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onRequestApproval(rule)}>
          {rule.requiresApproval ? "Solicitar automática" : "Solicitar aprobación"}
        </Button>
      </div>
    </article>
  )
}

function PendingRequestsCard({
  requests,
  onApprove,
  onReject,
}: {
  requests: LimitPolicyChangeRequest[]
  onApprove: (request: LimitPolicyChangeRequest) => void
  onReject: (request: LimitPolicyChangeRequest) => void
}) {
  return (
    <section className="rounded-[1.5rem] border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:shadow-none">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-background">
          <IconGitPullRequest className="size-5 text-[#ff6c02]" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff6c02]">
            Doble control
          </p>
          <h2 className="mt-2 text-2xl font-bold">Solicitudes pendientes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ningún ajuste crítico se aplica hasta que otro administrador lo apruebe.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
          No hay solicitudes pendientes de aprobación.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-[1.25rem] border bg-background/60 p-4 dark:bg-black/20">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{request.ruleId}</p>
                    <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                      {request.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{request.requestReason}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Solicitado por {request.requestedBy} · {new Date(request.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" className="rounded-full" onClick={() => onApprove(request)}>
                    <IconCircleCheck className="size-4" />
                    Aprobar
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => onReject(request)}>
                    <IconCircleX className="size-4" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ChangeLogCard({ changes }: { changes: LimitPolicyChange[] }) {
  return (
    <section className="rounded-[1.5rem] border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:shadow-none">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-background">
          <IconHistory className="size-5 text-[#ff6c02]" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff6c02]">
            Bitácora auditada
          </p>
          <h2 className="mt-2 text-2xl font-bold">Cambios recientes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada ajuste de límites debe registrar versión, actor y razón antes de afectar operación.
          </p>
        </div>
      </div>

      {changes.length === 0 ? (
        <div className="rounded-[1.5rem] border p-6 text-sm text-muted-foreground">
          Todavía no hay cambios administrativos registrados.
        </div>
      ) : (
        <div className="space-y-3">
          {changes.map((change) => (
            <div key={change.id} className="rounded-[1.25rem] border bg-background/60 p-4 dark:bg-black/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{change.ruleId}</p>
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                  v{change.version}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{change.reason}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {change.changedBy} · {new Date(change.createdAt).toLocaleString("es-CO")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function LimitPoliciesPage() {
  const {
    rules,
    changes,
    requests,
    evaluation,
    loading,
    error,
    summary,
    reload,
    requestRuleChange,
    reviewRequest,
  } = useLimitPolicies()

  async function requestRuleUpdate(
    rule: LimitPolicyRule,
    payload: { enabled?: boolean; requiresApproval?: boolean },
  ) {
    const reason = window.prompt(`Razón auditada para modificar ${rule.name}`)
    if (!reason) return
    await requestRuleChange(rule.id, { ...payload, reason })
  }

  async function requestReview(request: LimitPolicyChangeRequest, action: "approve" | "reject") {
    const reason = window.prompt(`Razón para ${action === "approve" ? "aprobar" : "rechazar"} ${request.ruleId}`)
    if (!reason) return
    await reviewRequest(request.id, action, reason)
  }

  return (
    <div className="space-y-8">
      <PageConnectionHeader
        title="Límites globales"
        description="Políticas operativas por KYC, riesgo, país, moneda, producto y tipo de operación."
        state={error ? "pending" : "partial"}
        percent={error ? 20 : 78}
        note="Lectura, evaluación, solicitudes y aprobación maker-checker pasan por Gateway Admin. Falta ejecución real contra ledger o custodia."
      />

      {error ? (
        <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Reglas" value={summary.total} label="Políticas registradas" />
        <SummaryCard title="Activas" value={summary.enabled} label="Afectan operación" />
        <SummaryCard title="Aprobación" value={summary.approval} label="Revisión manual" />
        <SummaryCard title="Pendientes" value={summary.pending} label="Doble control" />
      </section>

      <PendingRequestsCard
        requests={requests}
        onApprove={(request) => void requestReview(request, "approve")}
        onReject={(request) => void requestReview(request, "reject")}
      />

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:shadow-none">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff6c02]">
              Policy engine
            </p>
            <h2 className="mt-2 text-2xl font-bold">Evaluación operativa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada depósito, retiro, pago, remesa o P2P debe consultar límites antes de afectar ledger o custodia.
            </p>
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void reload()}>
            <IconRefresh className="size-4" />
            Actualizar
          </Button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[1.25rem] border bg-background/60 p-4 dark:bg-black/20">
            <div className="flex items-start gap-3">
              <IconShieldLock className="mt-0.5 size-5 shrink-0 text-[#ff6c02]" />
              <div>
                <p className="font-semibold">Ruta obligatoria</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Admin Panel → BFF → Gateway Admin → Limits Policy. Nada de llamadas directas al micro.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.25rem] border bg-background/60 p-4 dark:bg-black/20">
            <div className="flex items-start gap-3">
              <IconTrafficLights className="mt-0.5 size-5 shrink-0 text-[#ff6c02]" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">Simulación COP retiro nivel 2</p>
                  {evaluation ? (
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${decisionClass[evaluation.decision]}`}
                    >
                      {evaluation.decision}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {evaluation?.reasons?.[0] ?? "Esperando respuesta del motor de límites."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:shadow-none">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Reglas de límites</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Base inicial para alimentar depósitos, retiros, P2P, remesas, pagos y transferencias.
            </p>
          </div>
          <IconArrowRight className="hidden size-5 text-muted-foreground md:block" />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] border p-8 text-center text-muted-foreground">
              Cargando políticas desde Gateway Admin...
            </div>
          ) : rules.length === 0 ? (
            <div className="rounded-[1.5rem] border p-8 text-center text-muted-foreground">
              No hay reglas de límites configuradas todavía.
            </div>
          ) : (
            rules.map((rule) => (
              <LimitRuleCard
                key={rule.id}
                rule={rule}
                onRequestEnabled={(item) => void requestRuleUpdate(item, { enabled: !item.enabled })}
                onRequestApproval={(item) =>
                  void requestRuleUpdate(item, { requiresApproval: !item.requiresApproval })
                }
              />
            ))
          )}
        </div>
      </section>

      <ChangeLogCard changes={changes} />
    </div>
  )
}
