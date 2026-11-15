"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

import {
  CreateCryptoFlowAuditActionInput,
  CryptoFlowAuditAction,
  TransitionCryptoFlowAuditActionInput,
  CryptoFlowAuditActionType,
  CryptoFlowAuditItem,
} from "./use-crypto-flows-audit"

type CryptoFlowActionsPanelProps = {
  flows: CryptoFlowAuditItem[]
  actions: CryptoFlowAuditAction[]
  loading: boolean
  error: string | null
  onCreate: (input: CreateCryptoFlowAuditActionInput) => Promise<CryptoFlowAuditAction>
  onTransition: (input: TransitionCryptoFlowAuditActionInput) => Promise<CryptoFlowAuditAction>
}

const actionOptions: Array<{ type: CryptoFlowAuditActionType; label: string }> = [
  { type: "block-withdrawal", label: "Bloquear retiro" },
  { type: "release-balance", label: "Liberar saldo" },
  { type: "open-investigation", label: "Abrir investigación" },
]

function actionLabel(type: CryptoFlowAuditAction["type"]) {
  if (type === "block_withdrawal") return "Bloquear retiro"
  if (type === "release_balance") return "Liberar saldo"
  return "Abrir investigación"
}

function statusLabel(status: string) {
  if (status.includes("approved")) return "Aprobada"
  if (status.includes("rejected")) return "Rechazada"
  if (status.includes("executed")) return "Ejecución simulada"
  if (status.includes("requested")) return "Solicitada"
  if (status.includes("opened")) return "Abierta"
  return status
}

function canApprove(status: string) {
  return !status.includes("approved") && !status.includes("rejected") && !status.includes("executed")
}

function canExecute(status: string) {
  return status.includes("approved") && !status.includes("executed") && !status.includes("rejected")
}

function compactHash(hash: string) {
  if (!hash) return "Sin hash"
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

export function CryptoFlowActionsPanel({
  flows,
  actions,
  loading,
  error,
  onCreate,
  onTransition,
}: CryptoFlowActionsPanelProps) {
  const [selectedFlowId, setSelectedFlowId] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [decisionReason, setDecisionReason] = useState("")
  const [decisionNotes, setDecisionNotes] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedFlow = useMemo(() => {
    return flows.find((flow) => flow.id === selectedFlowId) ?? flows[0]
  }, [flows, selectedFlowId])

  async function submitAction(actionType: CryptoFlowAuditActionType) {
    setLocalError(null)
    setSuccess(null)

    if (!selectedFlow) {
      setLocalError("No hay flujo seleccionado para registrar acción.")
      return
    }
    if (!reason.trim()) {
      setLocalError("El motivo es obligatorio para dejar trazabilidad.")
      return
    }

    const record = await onCreate({ actionType, flow: selectedFlow, reason, notes }).catch(() => null)
    if (!record) return

    setSuccess(`Acción registrada: ${actionLabel(record.type)}.`)
    setReason("")
    setNotes("")
  }

  async function submitTransition(actionId: string, operation: TransitionCryptoFlowAuditActionInput["operation"]) {
    setLocalError(null)
    setSuccess(null)

    if (!decisionReason.trim()) {
      setLocalError("El motivo de aprobación, rechazo o ejecución es obligatorio.")
      return
    }

    const record = await onTransition({
      actionId,
      operation,
      reason: decisionReason,
      notes: decisionNotes,
    }).catch(() => null)
    if (!record) return

    setSuccess(`Acción actualizada: ${statusLabel(record.status)}.`)
    setDecisionReason("")
    setDecisionNotes("")
  }

  return (
    <Card className="rounded-[1.5rem]">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Acciones auditadas</CardTitle>
          <CardDescription>
            Registra intención administrativa antes de ejecutar cambios contra custodia y límites.
          </CardDescription>
        </div>
        <Badge variant="outline" className="rounded-full">
          {actions.length} registros
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-3 rounded-[1.25rem] border bg-card/70 p-4">
          <label className="grid gap-2 text-sm font-medium">
            Flujo
            <select
              value={selectedFlow?.id ?? ""}
              onChange={(event) => setSelectedFlowId(event.target.value)}
              className="h-11 rounded-full border bg-background px-4 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              disabled={!flows.length || loading}
            >
              {flows.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.asset} · {flow.network} · {compactHash(flow.txHash)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Motivo
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ej. Revisión AML pendiente antes de liberar saldo."
              className="min-h-20 rounded-[1rem]"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Nota interna
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contexto opcional para el equipo de operaciones."
              className="min-h-16 rounded-[1rem]"
            />
          </label>

          {(localError || error || success) && (
            <p className="text-sm text-muted-foreground">{localError ?? error ?? success}</p>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            {actionOptions.map((action) => (
              <Button
                key={action.type}
                type="button"
                variant="outline"
                className="h-11 rounded-full"
                disabled={loading || !flows.length}
                onClick={() => void submitAction(action.type)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-[1.25rem] border bg-card/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Últimas acciones</p>
            <Badge variant="outline" className="rounded-full">
              Gateway Admin
            </Badge>
          </div>
          <div className="grid gap-2">
            <label className="grid gap-2 text-sm font-medium">
              Motivo maker-checker
              <Textarea
                value={decisionReason}
                onChange={(event) => setDecisionReason(event.target.value)}
                placeholder="Ej. Aprobado por evidencia suficiente y riesgo controlado."
                className="min-h-16 rounded-[1rem]"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Nota de transición
              <Textarea
                value={decisionNotes}
                onChange={(event) => setDecisionNotes(event.target.value)}
                placeholder="Detalle opcional para auditoría."
                className="min-h-12 rounded-[1rem]"
              />
            </label>
          </div>
          {actions.length ? (
            <div className="space-y-2">
              {actions.slice(0, 5).map((action) => (
                <div key={action.actionId} className="rounded-[1rem] border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{actionLabel(action.type)}</span>
                    <Badge variant="outline" className="rounded-full">
                      {statusLabel(action.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {action.asset || "Activo"} · {action.network || "red"} · {action.userId || "sin usuario"} ·{" "}
                    {compactHash(action.txHash)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-muted-foreground">{action.reason}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-full"
                      disabled={loading || !canApprove(action.status)}
                      onClick={() => void submitTransition(action.actionId, "approve")}
                    >
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-full"
                      disabled={loading || !canApprove(action.status)}
                      onClick={() => void submitTransition(action.actionId, "reject")}
                    >
                      Rechazar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-full"
                      disabled={loading || !canExecute(action.status)}
                      onClick={() => void submitTransition(action.actionId, "execute")}
                    >
                      Ejecutar
                    </Button>
                  </div>
                  {action.executionMessage ? (
                    <p className="mt-2 text-xs text-muted-foreground">{action.executionMessage}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay acciones registradas para flujos crypto.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
