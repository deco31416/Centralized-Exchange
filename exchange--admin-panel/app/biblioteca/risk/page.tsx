"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  IconAlertTriangle,
  IconBan,
  IconEye,
  IconRefresh,
  IconShield,
  IconShieldCheck,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type RiskLevel = "green" | "orange" | "red"

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

type KycRiskOverview = {
  riskProfiles: number
  greenUsers: number
  orangeUsers: number
  redUsers: number
  monitoringUsers: number
  blockedUsers: number
}

type RiskMatrixItem = {
  level: RiskLevel
  label: string
  range: string
  action: string
}

const fallbackOverview: KycRiskOverview = {
  riskProfiles: 0,
  greenUsers: 0,
  orangeUsers: 0,
  redUsers: 0,
  monitoringUsers: 0,
  blockedUsers: 0,
}

const riskLevelLabel: Record<RiskLevel, string> = {
  green: "Verde",
  orange: "Naranja",
  red: "Rojo",
}

const riskLevelClass: Record<RiskLevel, string> = {
  green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  orange: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  red: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

export default function RiskProfilePage() {
  const [overview, setOverview] = useState<KycRiskOverview>(fallbackOverview)
  const [profiles, setProfiles] = useState<UserRiskProfile[]>([])
  const [matrix, setMatrix] = useState<RiskMatrixItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadRisk() {
    setLoading(true)
    setError(null)
    try {
      const [overviewData, profileData, matrixData] = await Promise.all([
        fetchJson<KycRiskOverview>("/api/kyc-risk/overview"),
        fetchJson<UserRiskProfile[]>("/api/kyc-risk/risk-profiles"),
        fetchJson<RiskMatrixItem[]>("/api/kyc-risk/risk-matrix"),
      ])
      setOverview(overviewData)
      setProfiles(profileData)
      setMatrix(matrixData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar el motor de riesgo")
      setOverview(fallbackOverview)
      setProfiles([])
      setMatrix([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRisk()
  }, [])

  const averageRisk = useMemo(() => {
    if (!profiles.length) return 0
    return Math.round(profiles.reduce((sum, item) => sum + item.riskScore, 0) / profiles.length)
  }, [profiles])

  const overviewStats = [
    {
      title: "Usuarios evaluados",
      value: overview.riskProfiles,
      change: { value: 0, label: "motor KYC/Risk", isPositive: true },
      icon: <IconShield className="size-5" />,
    },
    {
      title: "Riesgo rojo",
      value: overview.redUsers,
      change: { value: 0, label: "requieren restricción", isPositive: overview.redUsers === 0 },
      icon: <IconAlertTriangle className="size-5" />,
    },
    {
      title: "En monitoreo",
      value: overview.monitoringUsers,
      change: { value: 0, label: "seguimiento reforzado", isPositive: true },
      icon: <IconEye className="size-5" />,
    },
    {
      title: "Restringidos",
      value: overview.blockedUsers,
      change: { value: 0, label: `score promedio ${averageRisk}/100`, isPositive: overview.blockedUsers === 0 },
      icon: <IconBan className="size-5" />,
    },
  ]

  const modules = [
    {
      title: "Bajo riesgo",
      href: "/biblioteca/risk/bajo",
      icon: <IconShieldCheck className="size-5" />,
      count: `${overview.greenUsers} usuarios`,
      level: "green" as RiskLevel,
    },
    {
      title: "Riesgo medio",
      href: "/biblioteca/risk/medio",
      icon: <IconShield className="size-5" />,
      count: `${overview.orangeUsers} usuarios`,
      level: "orange" as RiskLevel,
    },
    {
      title: "Riesgo alto",
      href: "/biblioteca/risk/alto",
      icon: <IconAlertTriangle className="size-5" />,
      count: `${overview.redUsers} usuarios`,
      level: "red" as RiskLevel,
    },
    {
      title: "En revisión",
      href: "/biblioteca/risk/revision",
      icon: <IconEye className="size-5" />,
      count: `${overview.monitoringUsers} usuarios`,
      level: "orange" as RiskLevel,
    },
    {
      title: "Blacklist",
      href: "/biblioteca/risk/blacklist",
      icon: <IconBan className="size-5" />,
      count: `${overview.blockedUsers} usuarios`,
      level: "red" as RiskLevel,
    },
    {
      title: "Monitoreo activo",
      href: "/biblioteca/risk/monitoreo",
      icon: <IconEye className="size-5" />,
      count: "Señales externas",
      level: "orange" as RiskLevel,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Motor de riesgo de usuario"
        description="Clasificación verde, naranja y roja basada en KYC, movimientos, seguridad, OSINT y señales blockchain."
        state={error ? "partial" : "connected"}
        percent={error ? 60 : 100}
        note="Clasificación y señales consultadas por Gateway Admin."
      />

      {error ? (
        <Card className="rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          El motor de riesgo no respondió todavía. Revisa que el gateway admin y el motor KYC/Risk estén activos.
        </Card>
      ) : null}

      <StatsCards stats={overviewStats} />

      <div className="grid grid-cols-1 gap-4 @xl/page:grid-cols-2 @4xl/page:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="group h-full cursor-pointer rounded-[1.5rem] border bg-card/85 p-5 shadow-[0_16px_45px_rgb(15_23_42/0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgb(15_23_42/0.12)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]">
              <div className="flex items-start gap-4">
                <div className={cn("rounded-2xl border bg-background/80 p-3", riskLevelClass[module.level])}>
                  {module.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
                    {module.title}
                  </h3>
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground">{module.count}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[1.5rem] border bg-card/85 p-5 shadow-[0_16px_45px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-foreground">Perfiles recientes</h3>
              <p className="text-sm text-muted-foreground">Lectura conectada desde el motor KYC/Risk.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadRisk()} disabled={loading}>
              <IconRefresh className={cn("size-4", loading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div key={profile.userId} className="rounded-2xl border bg-background/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{profile.userId}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{profile.reason}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      KYC: {profile.kycLevel} · {profile.signals.length} señales
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("rounded-full", riskLevelClass[profile.riskLevel])}>
                      {riskLevelLabel[profile.riskLevel]}
                    </Badge>
                    <span className="text-2xl font-black tabular-nums">{profile.riskScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border bg-card/85 p-5 shadow-[0_16px_45px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]">
          <h3 className="font-bold text-foreground">Matriz de riesgo</h3>
          <p className="mt-1 text-sm text-muted-foreground">Semáforo operativo para decisiones del admin.</p>
          <div className="mt-4 space-y-3">
            {matrix.map((item) => (
              <div key={item.level} className="rounded-2xl border bg-background/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge className={cn("rounded-full", riskLevelClass[item.level])}>{item.label}</Badge>
                  <span className="text-sm font-bold tabular-nums">{item.range}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.action}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
