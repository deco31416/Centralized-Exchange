"use client"

import React, { useState, useCallback } from "react"
import {
  FileText, Download, RefreshCw, AlertTriangle,
  TrendingUp, TrendingDown, BarChart3, Calendar,
  Filter, CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import type { Movement } from "@/components/dashboard/types"

// ─── Tipos ──────────────────────────────────────────────────────────
interface ReportSummary {
  total: number
  ingresos: number
  egresos: number
  byType: Record<string, number>
}

// ─── Períodos predefinidos ───────────────────────────────────────────
const PERIODS = [
  {
    id: "month",
    label: "Este mes",
    getRange: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: from.toISOString().split("T")[0], to: now.toISOString().split("T")[0] }
    },
  },
  {
    id: "quarter",
    label: "Últimos 3 meses",
    getRange: () => {
      const now = new Date()
      const from = new Date(now)
      from.setMonth(from.getMonth() - 3)
      return { from: from.toISOString().split("T")[0], to: now.toISOString().split("T")[0] }
    },
  },
  {
    id: "year",
    label: "Este año",
    getRange: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), 0, 1)
      return { from: from.toISOString().split("T")[0], to: now.toISOString().split("T")[0] }
    },
  },
  {
    id: "custom",
    label: "Personalizado",
    getRange: () => ({ from: "", to: "" }),
  },
] as const

type PeriodId = typeof PERIODS[number]["id"]

const MOVEMENT_TYPES = [
  { id: "", label: "Todos los tipos" },
  { id: "wallet", label: "Wallet" },
  { id: "p2p", label: "P2P / Pagos" },
  { id: "payment", label: "Cobros QR" },
  { id: "remittance", label: "Remesas" },
  { id: "saving", label: "Ahorros" },
] as const

const INCOME_STATUSES = ["completed", "success", "approved", "paid"]
const DEBIT_TYPES = ["send", "withdrawal", "fee", "transfer_out"]

function classifyMovement(m: Movement): "ingreso" | "egreso" | "neutro" {
  const type = (m.type ?? "").toLowerCase()
  const status = (m.status ?? "").toLowerCase()
  const direction = (m as any).direction ?? ""

  if (direction === "in" || direction === "credit") return "ingreso"
  if (direction === "out" || direction === "debit") return "egreso"
  if (DEBIT_TYPES.some((t) => type.includes(t))) return "egreso"
  if (INCOME_STATUSES.includes(status)) return "ingreso"
  return "neutro"
}

function buildSummary(movements: Movement[]): ReportSummary {
  let ingresos = 0
  let egresos = 0
  const byType: Record<string, number> = {}

  for (const m of movements) {
    const classification = classifyMovement(m)
    const amount = Number(m.amount ?? 0)

    if (classification === "ingreso") ingresos += amount
    else if (classification === "egreso") egresos += amount

    const type = m.type ?? "otro"
    byType[type] = (byType[type] ?? 0) + amount
  }

  return { total: movements.length, ingresos, egresos, byType }
}

// ─── Generación de CSV ───────────────────────────────────────────────
function generateCSV(movements: Movement[], periodLabel: string): void {
  const headers = [
    "ID",
    "Fecha",
    "Tipo",
    "Descripción",
    "Monto",
    "Moneda",
    "Estado",
    "Clasificación",
  ]

  const rows = movements.map((m) => {
    const date = m.createdAt
      ? new Date(m.createdAt).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : ""

    const classification = classifyMovement(m)

    return [
      m.id ?? m._id ?? "",
      date,
      m.type ?? "",
      (m.description ?? m.concept ?? "").replace(/,/g, " "),
      Number(m.amount ?? 0).toFixed(2),
      m.currency ?? "",
      m.status ?? "",
      classification,
    ]
  })

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
  const bom = "\uFEFF" // UTF-8 BOM para Excel
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `reporte-deco-exchange-${periodLabel.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Componente principal ────────────────────────────────────────────
export default function TabReportes() {
  const [period, setPeriod] = useState<PeriodId>("month")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [movType, setMovType] = useState("")

  const [movements, setMovements] = useState<Movement[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)

  const selectedPeriod = PERIODS.find((p) => p.id === period)!

  function getDateRange() {
    if (period === "custom") return { from: customFrom, to: customTo }
    return selectedPeriod.getRange()
  }

  const handleFetch = useCallback(async () => {
    const { from, to } = getDateRange()
    if (period === "custom" && (!from || !to)) {
      setError("Selecciona un rango de fechas válido")
      return
    }

    setLoading(true)
    setError(null)
    setFetched(false)

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "500",
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(movType ? { type: movType } : {}),
      })

      const r = await fetch(`/api/movements?${params.toString()}`, { credentials: "include" })
      if (!r.ok) throw new Error(`Error ${r.status}`)

      const data = await r.json()
      // movements-core retorna { data: [...], total, page, ... } o { movements: [...] }
      const list: Movement[] = data.data ?? data.movements ?? data ?? []

      setMovements(list)
      setSummary(buildSummary(list))
      setFetched(true)
    } catch {
      setError("No se pudo cargar el reporte. Verifica tu conexión.")
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customFrom, customTo, movType])

  function handleDownload() {
    if (!movements.length) return
    const label = period === "custom" ? `${customFrom}_${customTo}` : selectedPeriod.label
    generateCSV(movements, label)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <DashCard className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Reportes financieros</p>
          <p className="text-xs text-muted-foreground">
            Exporta tus operaciones en CSV para declaraciones contables y fiscales
          </p>
        </div>
      </DashCard>

      {/* Filtros */}
      <DashCard>
        <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filtros del reporte
        </p>

        {/* Período */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Período</p>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                  period === p.id
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                <Calendar className="h-3 w-3" />
                {p.label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Desde</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Hasta</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tipo de movimiento */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Tipo de operación</p>
          <div className="flex flex-wrap gap-2">
            {MOVEMENT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setMovType(t.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                  movType === t.id
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleFetch} disabled={loading} size="sm" className="w-full sm:w-auto">
          {loading ? (
            <><RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />Generando reporte…</>
          ) : (
            <><BarChart3 className="h-3.5 w-3.5 mr-2" />Generar reporte</>
          )}
        </Button>
      </DashCard>

      {error && (
        <DashCard className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        </DashCard>
      )}

      {/* Resultados */}
      {fetched && summary && (
        <>
          {/* Resumen estadístico */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DashCard className="text-center">
              <p className="text-2xl font-bold text-foreground">{summary.total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Operaciones</p>
            </DashCard>
            <DashCard className="text-center border-green-400/20">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <p className="text-xs text-muted-foreground">Ingresos</p>
              </div>
              <p className="text-lg font-bold text-green-400">
                {summary.ingresos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </DashCard>
            <DashCard className="text-center border-red-400/20 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                <p className="text-xs text-muted-foreground">Egresos</p>
              </div>
              <p className="text-lg font-bold text-red-400">
                {summary.egresos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </DashCard>
          </div>

          {/* Desglose por tipo */}
          {Object.keys(summary.byType).length > 0 && (
            <DashCard>
              <p className="text-xs font-medium text-muted-foreground mb-3">Desglose por tipo</p>
              <div className="flex flex-col gap-2">
                {Object.entries(summary.byType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, amount]) => (
                    <div key={type} className="flex items-center justify-between gap-2">
                      <span className="text-xs capitalize text-muted-foreground">{type}</span>
                      <span className="text-xs font-mono font-medium text-foreground">
                        {Number(amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </DashCard>
          )}

          {/* Descarga */}
          <DashCard className="bg-muted/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Reporte listo — {summary.total} registros
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Descarga el archivo CSV para importarlo en tu software contable o para tu declaración fiscal
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!movements.length}
                className="shrink-0"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Descargar CSV
              </Button>
            </div>
          </DashCard>

          {/* Aviso fiscal */}
          <DashCard className="bg-yellow-400/5 border border-yellow-400/20">
            <p className="text-xs text-yellow-400/80">
              <strong className="text-yellow-400">Aviso:</strong> Este reporte es una exportación de tus operaciones registradas en la plataforma.
              Consulta a un contador certificado para validar su uso en declaraciones fiscales o contables.
              Los montos están expresados en la moneda de cada operación.
            </p>
          </DashCard>
        </>
      )}

      {fetched && movements.length === 0 && (
        <DashCard className="text-center py-8">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay operaciones en el período seleccionado</p>
        </DashCard>
      )}
    </div>
  )
}
