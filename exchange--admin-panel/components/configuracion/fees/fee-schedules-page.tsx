"use client"

import {
  IconAdjustmentsDollar,
  IconRefresh,
  IconShieldCheck,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { FeeSchedule } from "./types"
import { getFeeScheduleId } from "./types"
import { useFeeSchedules } from "./use-fee-schedules"

const scopeLabels = {
  GLOBAL: "Global",
  NETWORK: "Red",
  ASSET: "Activo",
  PAIR: "Par",
} as const

const operationLabels = {
  BUY: "Compra",
  SELL: "Venta",
  WITHDRAW: "Retiro",
  DEPOSIT: "Depósito",
  SWAP: "Conversión",
} as const

const feeTypeLabels = {
  FIXED: "Fija",
  PERCENTAGE: "Porcentaje",
} as const

function formatDate(value?: string) {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sin fecha"

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatFee(schedule: FeeSchedule) {
  if (schedule.feeType === "PERCENTAGE") return `${schedule.value}%`
  return schedule.value.toLocaleString("es-CO", {
    maximumFractionDigits: 6,
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

function FeeScheduleCard({
  schedule,
  updating,
  onToggle,
}: {
  schedule: FeeSchedule
  updating: boolean
  onToggle: (enabled: boolean) => void
}) {
  const refs = schedule.refIds?.length ? schedule.refIds.join(", ") : "Todos"

  return (
    <article className="rounded-[1.5rem] border bg-background/60 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-colors dark:bg-black/20 dark:shadow-none">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-card">
            <IconAdjustmentsDollar className="size-5 text-[#ff6c02]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold">
                {operationLabels[schedule.operation] ?? schedule.operation}
              </h3>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              >
                {scopeLabels[schedule.scope] ?? schedule.scope}
              </Badge>
              <Badge
                variant="outline"
                className={
                  schedule.enabled
                    ? "rounded-full border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
                    : "rounded-full px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                }
              >
                {schedule.enabled ? "Activa" : "Pausada"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {refs}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={updating}
          onClick={() => onToggle(!schedule.enabled)}
        >
          {schedule.enabled ? (
            <IconToggleRight className="size-4" />
          ) : (
            <IconToggleLeft className="size-4" />
          )}
          {schedule.enabled ? "Pausar" : "Activar"}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xs text-muted-foreground">Tipo</p>
          <p className="font-semibold">{feeTypeLabels[schedule.feeType] ?? schedule.feeType}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Valor</p>
          <p className="font-semibold">{formatFee(schedule)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Prioridad</p>
          <p className="font-semibold">{schedule.priority}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Desde</p>
          <p className="font-semibold">{formatDate(schedule.effectiveFrom)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Hasta</p>
          <p className="font-semibold">{formatDate(schedule.effectiveUntil)}</p>
        </div>
      </div>
    </article>
  )
}

export function FeeSchedulesPage() {
  const { schedules, loading, error, updatingId, summary, reload, setEnabled } =
    useFeeSchedules()

  return (
    <div className="space-y-8">
      <PageConnectionHeader
        title="Fees y comisiones"
        description="Control administrativo de reglas que impactan tarifas, spreads y comisiones visibles para usuarios."
        state={error ? "pending" : "partial"}
        percent={error ? 25 : 45}
        note="Lectura y activación pasan por Gateway Admin. Crear, editar y aprobar cambios queda como siguiente fase con auditoría."
      />

      {error ? (
        <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Reglas" value={summary.total} label="Schedules configurados" />
        <SummaryCard title="Activas" value={summary.active} label="Impactan cotizaciones" />
        <SummaryCard title="Por par" value={summary.byPair} label="Control granular" />
        <SummaryCard title="Globales" value={summary.global} label="Reglas base" />
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:shadow-none">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff6c02]">
              Pricing control
            </p>
            <h2 className="mt-2 text-2xl font-bold">Reglas de fees</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estas reglas deben reconciliarse con custodia, ledger y auditoría antes de permitir edición abierta.
            </p>
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void reload()}>
            <IconRefresh className="size-4" />
            Actualizar
          </Button>
        </div>

        <div className="mt-5 rounded-[1.25rem] border bg-background/60 p-4 text-sm text-muted-foreground dark:bg-black/20">
          <div className="flex items-start gap-3">
            <IconShieldCheck className="mt-0.5 size-5 shrink-0 text-[#ff6c02]" />
            <p>
              Las modificaciones de fees/spreads cambian lo que ve el usuario. La fase de edición debe guardar actor,
              razón, versión anterior, versión nueva y reporte para cumplimiento.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] border p-8 text-center text-muted-foreground">
              Cargando reglas desde Gateway Admin...
            </div>
          ) : schedules.length === 0 ? (
            <div className="rounded-[1.5rem] border p-8 text-center text-muted-foreground">
              No hay reglas de fees configuradas todavía.
            </div>
          ) : (
            schedules.map((schedule) => {
              const id = getFeeScheduleId(schedule)
              return (
                <FeeScheduleCard
                  key={id}
                  schedule={schedule}
                  updating={updatingId === id}
                  onToggle={(enabled) => void setEnabled(schedule, enabled)}
                />
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
