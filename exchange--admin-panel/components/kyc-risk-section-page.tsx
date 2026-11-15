"use client"

import { useEffect, useMemo, useState } from "react"
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconFileText,
  IconRefresh,
  IconShield,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable, type Transaction } from "@/components/operaciones/transaction-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KycMode = "level_1" | "level_2" | "level_3" | "pending" | "rejected" | "aml"

type UserRiskProfile = {
  userId: string
  kycLevel: "none" | "level_1" | "level_2" | "level_3" | "institutional"
  riskScore: number
  riskLevel: "green" | "orange" | "red"
  status: "active" | "monitoring" | "restricted" | "blocked"
  reason: string
  signals: { source: string; severity: string; label: string }[]
  lastAssessmentAt: string
}

type KycRiskCase = {
  caseId: string
  userId: string
  type: "kyc" | "aml" | "risk" | "manual_review"
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "in_review" | "approved" | "rejected" | "escalated" | "closed"
  reason: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const modeCopy: Record<KycMode, { title: string; description: string; kind: "profile" | "case"; kycLevel?: UserRiskProfile["kycLevel"]; caseStatus?: KycRiskCase["status"][]; caseType?: KycRiskCase["type"][] }> = {
  level_1: {
    title: "KYC Nivel 1",
    description: "Usuarios con verificación básica y límites operativos iniciales.",
    kind: "profile",
    kycLevel: "level_1",
  },
  level_2: {
    title: "KYC Nivel 2",
    description: "Usuarios con validación intermedia y mayor capacidad operativa.",
    kind: "profile",
    kycLevel: "level_2",
  },
  level_3: {
    title: "KYC Nivel 3",
    description: "Usuarios con verificación avanzada y revisión reforzada.",
    kind: "profile",
    kycLevel: "level_3",
  },
  pending: {
    title: "KYC pendientes",
    description: "Casos abiertos o en revisión que esperan validación del equipo.",
    kind: "case",
    caseType: ["kyc", "manual_review"],
    caseStatus: ["open", "in_review", "escalated"],
  },
  rejected: {
    title: "KYC rechazados",
    description: "Casos rechazados con motivo operativo o documental.",
    kind: "case",
    caseType: ["kyc", "manual_review"],
    caseStatus: ["rejected"],
  },
  aml: {
    title: "AML y monitoreo",
    description: "Alertas de cumplimiento, actividad sospechosa y revisión AML.",
    kind: "case",
    caseType: ["aml", "risk", "manual_review"],
    caseStatus: ["open", "in_review", "escalated"],
  },
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

function statusBadge(status: string) {
  const cls =
    status === "active" || status === "approved"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : status === "rejected" || status === "restricted" || status === "blocked"
        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"

  return <Badge className={cn("rounded-full", cls)}>{status}</Badge>
}

export function KycRiskSectionPage({ mode }: { mode: KycMode }) {
  const config = modeCopy[mode]
  const [profiles, setProfiles] = useState<UserRiskProfile[]>([])
  const [cases, setCases] = useState<KycRiskCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      if (config.kind === "profile") {
        const data = await fetchJson<UserRiskProfile[]>("/api/kyc-risk/risk-profiles")
        setProfiles(data)
      } else {
        const data = await fetchJson<KycRiskCase[]>("/api/kyc-risk/cases")
        setCases(data)
      }
    } catch (err) {
      setProfiles([])
      setCases([])
      setError(err instanceof Error ? err.message : "No se pudo conectar KYC/Risk")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredProfiles = useMemo(
    () => profiles.filter((profile) => profile.kycLevel === config.kycLevel),
    [profiles, config.kycLevel],
  )
  const filteredCases = useMemo(
    () =>
      cases.filter((item) => {
        const typeMatch = !config.caseType || config.caseType.includes(item.type)
        const statusMatch = !config.caseStatus || config.caseStatus.includes(item.status)
        return typeMatch && statusMatch
      }),
    [cases, config.caseStatus, config.caseType],
  )

  const rows: Transaction[] =
    config.kind === "profile"
      ? filteredProfiles.map((profile) => ({
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
      : filteredCases.map((item) => ({
          id: item.caseId,
          caseId: item.caseId,
          userId: item.userId,
          type: item.type,
          severity: item.severity,
          status: item.status,
          reason: item.reason,
          createdAt: item.createdAt,
        }))

  const criticalCount =
    config.kind === "profile"
      ? filteredProfiles.filter((item) => item.riskLevel === "red" || item.status === "restricted").length
      : filteredCases.filter((item) => item.severity === "high" || item.severity === "critical").length

  const stats = [
    {
      title: config.kind === "profile" ? "Usuarios" : "Casos",
      value: rows.length,
      change: { value: 0, label: "desde KYC/Risk", isPositive: true },
      icon: config.kind === "profile" ? <IconShieldCheck className="size-5" /> : <IconFileText className="size-5" />,
    },
    {
      title: config.kind === "profile" ? "Riesgo alto" : "Alta prioridad",
      value: criticalCount,
      change: { value: 0, label: "revisión operativa", isPositive: criticalCount === 0 },
      icon: <IconAlertTriangle className="size-5" />,
    },
    {
      title: config.kind === "profile" ? "Señales" : "Abiertos",
      value: config.kind === "profile" ? filteredProfiles.reduce((sum, item) => sum + item.signals.length, 0) : filteredCases.filter((item) => item.status === "open").length,
      change: { value: 0, label: "monitoreo", isPositive: true },
      icon: <IconShield className="size-5" />,
    },
    {
      title: "Última lectura",
      value: loading ? "..." : "Ahora",
      change: { value: 0, label: "Gateway admin", isPositive: !error },
      icon: mode === "rejected" ? <IconX className="size-5" /> : mode === "aml" ? <IconCheck className="size-5" /> : <IconClock className="size-5" />,
    },
  ]

  const columns =
    config.kind === "profile"
      ? [
          { key: "userId", label: "Usuario" },
          { key: "kycLevel", label: "Nivel KYC" },
          { key: "riskScore", label: "Score" },
          { key: "riskLevel", label: "Riesgo" },
          { key: "signals", label: "Señales" },
          { key: "reason", label: "Motivo" },
          { key: "status", label: "Estado", render: (value: string) => statusBadge(value) },
          { key: "lastAssessmentAt", label: "Evaluación" },
        ]
      : [
          { key: "caseId", label: "Caso" },
          { key: "userId", label: "Usuario" },
          { key: "type", label: "Tipo" },
          { key: "severity", label: "Severidad" },
          { key: "reason", label: "Motivo" },
          { key: "status", label: "Estado", render: (value: string) => statusBadge(value) },
          { key: "createdAt", label: "Creado" },
        ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={config.title}
        description={config.description}
        state={error ? "partial" : "connected"}
        percent={error ? 60 : 100}
        note="Lectura conectada por Gateway Admin al motor KYC/Risk."
      />

      {error ? (
        <Card className="rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          KYC/Risk no respondió todavía. Revisa que el gateway admin y el motor KYC/Risk estén activos.
        </Card>
      ) : null}

      <StatsCards stats={stats} />

      <Card className="rounded-[1.5rem] border bg-card/85 p-5 shadow-[0_16px_45px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Lectura conectada</h2>
            <p className="text-sm text-muted-foreground">Datos persistidos en Mongo por el micro KYC/Risk.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
            <IconRefresh className={cn("size-4", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
        <TransactionTable
          columns={columns}
          data={rows}
          itemsPerPage={8}
          emptyMessage={
            config.kind === "profile"
              ? "No hay perfiles de riesgo para mostrar"
              : "No hay casos KYC/Risk para mostrar"
          }
        />
      </Card>
    </div>
  )
}
