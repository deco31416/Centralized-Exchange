"use client"

import { useEffect, useMemo, useState } from "react"
import {
  IconAlertTriangle,
  IconBan,
  IconClock,
  IconEye,
  IconRefresh,
  IconShield,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable, type Transaction } from "@/components/operaciones/transaction-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type RiskLevel = "green" | "orange" | "red"
type RiskMode = "low" | "medium" | "high" | "monitoring" | "review" | "blacklist"

type UserRiskProfile = {
  userId: string
  kycLevel: "none" | "level_1" | "level_2" | "level_3" | "institutional"
  riskScore: number
  riskLevel: RiskLevel
  status: "active" | "monitoring" | "restricted" | "blocked"
  reason: string
  signals: {
    source: string
    label: string
    scoreImpact: number
    severity: "low" | "medium" | "high" | "critical"
    observedAt: string
  }[]
  lastAssessmentAt: string
}

const levelClass: Record<RiskLevel, string> = {
  green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  orange: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  red: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
}

const levelLabel: Record<RiskLevel, string> = {
  green: "Verde",
  orange: "Naranja",
  red: "Rojo",
}

const modeCopy: Record<RiskMode, { title: string; description: string; level?: RiskLevel; status?: UserRiskProfile["status"][] }> = {
  low: {
    title: "Usuarios bajo riesgo",
    description: "Perfiles con operación normal y monitoreo estándar.",
    level: "green",
  },
  medium: {
    title: "Usuarios riesgo medio",
    description: "Perfiles en observación por señales moderadas.",
    level: "orange",
  },
  high: {
    title: "Usuarios riesgo alto",
    description: "Perfiles que requieren restricción, revisión o escalamiento.",
    level: "red",
  },
  monitoring: {
    title: "Monitoreo activo de riesgo",
    description: "Usuarios con seguimiento reforzado por patrones detectados.",
    status: ["monitoring"],
  },
  review: {
    title: "Perfiles en revisión",
    description: "Casos que requieren validación del equipo de cumplimiento.",
    status: ["monitoring", "restricted"],
  },
  blacklist: {
    title: "Usuarios restringidos",
    description: "Perfiles bloqueados o restringidos por riesgo operativo.",
    status: ["restricted", "blocked"],
  },
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

function matchesMode(profile: UserRiskProfile, mode: RiskMode) {
  const config = modeCopy[mode]
  if (config.level) return profile.riskLevel === config.level
  if (config.status) return config.status.includes(profile.status)
  return true
}

function toRows(profiles: UserRiskProfile[]): Transaction[] {
  return profiles.map((profile) => ({
    id: profile.userId,
    userId: profile.userId,
    kycLevel: profile.kycLevel,
    riskScore: profile.riskScore,
    riskLevel: profile.riskLevel,
    status: profile.status,
    signals: profile.signals.length,
    reason: profile.reason,
    lastAssessmentAt: profile.lastAssessmentAt,
  }))
}

export function RiskProfileSectionPage({ mode }: { mode: RiskMode }) {
  const [profiles, setProfiles] = useState<UserRiskProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const config = modeCopy[mode]

  async function loadProfiles() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJson<UserRiskProfile[]>("/api/kyc-risk/risk-profiles")
      setProfiles(data)
    } catch (err) {
      setProfiles([])
      setError(err instanceof Error ? err.message : "No se pudo conectar KYC/Risk")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfiles()
  }, [])

  const filtered = useMemo(() => profiles.filter((profile) => matchesMode(profile, mode)), [profiles, mode])
  const averageScore = useMemo(() => {
    if (!filtered.length) return 0
    return Math.round(filtered.reduce((sum, item) => sum + item.riskScore, 0) / filtered.length)
  }, [filtered])
  const criticalSignals = filtered.reduce(
    (sum, item) => sum + item.signals.filter((signal) => signal.severity === "critical" || signal.severity === "high").length,
    0,
  )

  const stats = [
    {
      title: "Perfiles",
      value: filtered.length,
      change: { value: 0, label: "desde KYC/Risk", isPositive: true },
      icon: mode === "low" ? <IconShieldCheck className="size-5" /> : <IconShield className="size-5" />,
    },
    {
      title: "Score promedio",
      value: averageScore,
      change: { value: 0, label: "rango 0-100", isPositive: averageScore < 71 },
      icon: <IconAlertTriangle className="size-5" />,
    },
    {
      title: "Señales críticas",
      value: criticalSignals,
      change: { value: 0, label: "high/critical", isPositive: criticalSignals === 0 },
      icon: <IconBan className="size-5" />,
    },
    {
      title: "Última lectura",
      value: loading ? "..." : "Ahora",
      change: { value: 0, label: "Gateway admin", isPositive: !error },
      icon: mode === "review" ? <IconUserCheck className="size-5" /> : mode === "monitoring" ? <IconEye className="size-5" /> : <IconClock className="size-5" />,
    },
  ]

  const columns = [
    { key: "userId", label: "Usuario" },
    { key: "kycLevel", label: "KYC" },
    { key: "riskScore", label: "Score" },
    {
      key: "riskLevel",
      label: "Riesgo",
      render: (value: RiskLevel) => (
        <Badge className={cn("rounded-full", levelClass[value])}>{levelLabel[value]}</Badge>
      ),
    },
    { key: "status", label: "Estado" },
    { key: "signals", label: "Señales" },
    { key: "reason", label: "Motivo" },
    { key: "lastAssessmentAt", label: "Evaluación" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={config.title}
        description={config.description}
        state={error ? "partial" : "connected"}
        percent={error ? 60 : 100}
        note="Lectura conectada por Gateway Admin al motor de riesgo."
      />

      {error ? (
        <Card className="rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          No se pudo leer el motor KYC/Risk. Revisa que el gateway admin y el motor de riesgo estén activos.
        </Card>
      ) : null}

      <StatsCards stats={stats} />

      <Card className="rounded-[1.5rem] border bg-card/85 p-5 shadow-[0_16px_45px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Perfiles filtrados</h2>
            <p className="text-sm text-muted-foreground">Datos persistidos en Mongo por el micro KYC/Risk.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadProfiles()} disabled={loading}>
            <IconRefresh className={cn("size-4", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
        <TransactionTable columns={columns} data={toRows(filtered)} itemsPerPage={8} />
      </Card>
    </div>
  )
}
