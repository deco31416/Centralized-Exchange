"use client"

import { IconAlertTriangle, IconCheck, IconClock, IconShieldCheck } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import type { PointDispute } from "./types"

type TimelineItem = {
  key: string
  title: string
  actor?: string
  role?: string
  note?: string
  at?: string
  tone: "neutral" | "success" | "warning"
}

const actionLabels: Record<string, string> = {
  dispute_review_started: "Revisión iniciada",
  dispute_resolved: "Resolución preparada",
  dispute_resolution_approved: "Resolución aprobada",
  dispute_resolution_rejected: "Resolución devuelta",
  dispute_resolution_execution_staged: "Ejecución en cola",
  dispute_resolution_execution_cancelled: "Orden cancelada",
  dispute_resolution_execution_refunded_user: "Usuario reintegrado",
  dispute_resolution_execution_released_to_point: "Punto listo para liquidación",
  dispute_resolution_execution_review_required: "Revisión requerida",
  dispute_rejected: "Disputa rechazada",
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-CO")
}

function toneForAction(action: string): TimelineItem["tone"] {
  if (action.includes("review_required") || action.includes("rejected")) return "warning"
  if (action.includes("approved") || action.includes("execution") || action.includes("resolved")) {
    return "success"
  }
  return "neutral"
}

function buildAuditItems(dispute: PointDispute): TimelineItem[] {
  const auditItems = (dispute.auditTrail ?? [])
    .map((event, index) => {
      const action = readString(event.action) ?? `evento_${index + 1}`
      if (!action.includes("dispute") && !action.includes("resolution")) return null

      return {
        key: `${action}-${index}`,
        title: actionLabels[action] ?? action.replaceAll("_", " "),
        actor: readString(event.actorId),
        role: readString(event.actorRole),
        note: readString(event.reason),
        at: readString(event.at),
        tone: toneForAction(action),
      } satisfies TimelineItem
    })
    .filter(Boolean) as TimelineItem[]

  const executionTone: TimelineItem["tone"] =
    dispute.resolutionExecutionStatus === "failed_review_required" ||
    dispute.resolutionExecutionStatus === "blocked"
      ? "warning"
      : "success"

  const rawFallbackItems: TimelineItem[] = [
    {
      key: "prepared",
      title: "Maker preparó resolución",
      actor: dispute.preparedBy,
      at: dispute.preparedAt,
      note: dispute.resolutionReason,
      tone: "neutral",
    },
    {
      key: "checked",
      title: "Checker aprobó resolución",
      actor: dispute.checkedBy,
      at: dispute.checkedAt,
      note: dispute.checkerNote,
      tone: "success",
    },
    {
      key: "executed",
      title: "Ejecución sensible",
      actor: dispute.executedBy,
      at: dispute.executedAt,
      note: dispute.executionNote ?? dispute.resolutionExecutionPlan,
      tone: executionTone,
    },
  ]
  const fallbackItems = rawFallbackItems.filter((item) => item.actor || item.at || item.note)

  return auditItems.length > 0 ? auditItems.slice(-5) : fallbackItems
}

function TimelineIcon({ tone }: { tone: TimelineItem["tone"] }) {
  if (tone === "success") return <IconCheck className="size-4" />
  if (tone === "warning") return <IconAlertTriangle className="size-4" />
  return <IconClock className="size-4" />
}

export function DisputeExecutionTimeline({ dispute }: { dispute: PointDispute }) {
  const items = buildAuditItems(dispute)

  return (
    <div className="mt-3 rounded-[1rem] border bg-background/70 p-3 dark:bg-black/25">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full border bg-background text-primary dark:bg-black">
            <IconShieldCheck className="size-4" />
          </span>
          <span className="text-sm font-extrabold text-foreground">Bitácora de ejecución</span>
        </div>
        <Badge variant="outline" className="rounded-full">
          {dispute.resolutionExecutionId ? "Idempotente" : "Pendiente"}
        </Badge>
      </div>

      {items.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {items.map((item) => (
            <div key={item.key} className="flex gap-3 rounded-[0.9rem] border bg-background/60 p-3 dark:bg-black/30">
              <span
                className={[
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                  item.tone === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : item.tone === "warning"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                <TimelineIcon tone={item.tone} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-bold text-foreground">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(item.at)}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.actor ? `${item.actor}${item.role ? ` · ${item.role}` : ""}` : "Actor no registrado"}
                  {item.note ? ` — ${item.note}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Todavía no hay eventos de ejecución. Cuando maker, checker o ejecutor actúen,
          esta bitácora mostrará la trazabilidad recibida desde Gateway Admin.
        </p>
      )}
    </div>
  )
}
