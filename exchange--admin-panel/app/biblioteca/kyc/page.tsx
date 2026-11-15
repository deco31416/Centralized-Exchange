"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  IconAlertTriangle,
  IconClock,
  IconFileText,
  IconRefresh,
  IconShield,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KycRiskOverview = {
  totalCases: number
  open: number
  inReview: number
  escalated: number
  critical: number
  enabledRules: number
  source: string
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
}

type KycRiskRule = {
  code: string
  name: string
  category: KycRiskCase["type"]
  severity: KycRiskCase["severity"]
  description: string
  enabled: boolean
}

const fallbackOverview: KycRiskOverview = {
  totalCases: 0,
  open: 0,
  inReview: 0,
  escalated: 0,
  critical: 0,
  enabledRules: 0,
  source: "gateway-admin",
}

const severityClass: Record<KycRiskCase["severity"], string> = {
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  critical: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
}

const statusLabel: Record<KycRiskCase["status"], string> = {
  open: "Abierto",
  in_review: "En revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
  escalated: "Escalado",
  closed: "Cerrado",
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

export default function KYCModulePage() {
  const [overview, setOverview] = useState<KycRiskOverview>(fallbackOverview)
  const [cases, setCases] = useState<KycRiskCase[]>([])
  const [rules, setRules] = useState<KycRiskRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadKycRisk() {
    setLoading(true)
    setError(null)
    try {
      const [overviewData, casesData, rulesData] = await Promise.all([
        fetchJson<KycRiskOverview>("/api/kyc-risk/overview"),
        fetchJson<KycRiskCase[]>("/api/kyc-risk/cases"),
        fetchJson<KycRiskRule[]>("/api/kyc-risk/rules"),
      ])
      setOverview(overviewData)
      setCases(casesData)
      setRules(rulesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar KYC/Risk")
      setOverview(fallbackOverview)
      setCases([])
      setRules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadKycRisk()
  }, [])

  const overviewStats = useMemo(
    () => [
      {
        title: "Casos totales",
        value: overview.totalCases,
        change: { value: 0, label: "desde KYC/Risk", isPositive: true },
        icon: <IconShieldCheck className="size-5" />,
      },
      {
        title: "Pendientes",
        value: overview.open,
        change: { value: 0, label: "casos abiertos", isPositive: true },
        icon: <IconClock className="size-5" />,
      },
      {
        title: "En revisión",
        value: overview.inReview,
        change: { value: 0, label: "revisión manual", isPositive: true },
        icon: <IconShield className="size-5" />,
      },
      {
        title: "Críticos",
        value: overview.critical,
        change: { value: 0, label: `${overview.enabledRules} reglas activas`, isPositive: overview.critical === 0 },
        icon: <IconAlertTriangle className="size-5" />,
      },
    ],
    [overview],
  )

  const modules = [
    {
      title: "Pendientes de verificación",
      href: "/biblioteca/kyc/pendientes",
      icon: <IconClock className="size-5" />,
      count: `${overview.open} casos`,
    },
    {
      title: "KYC Nivel 1",
      href: "/biblioteca/kyc/nivel-1",
      icon: <IconShieldCheck className="size-5" />,
      count: "Básico",
    },
    {
      title: "KYC Nivel 2",
      href: "/biblioteca/kyc/nivel-2",
      icon: <IconShield className="size-5" />,
      count: "Intermedio",
    },
    {
      title: "KYC Nivel 3",
      href: "/biblioteca/kyc/nivel-3",
      icon: <IconShield className="size-5" />,
      count: "Avanzado",
    },
    {
      title: "Verificaciones rechazadas",
      href: "/biblioteca/kyc/rechazados",
      icon: <IconX className="size-5" />,
      count: "Histórico",
    },
    {
      title: "Documentos y evidencias",
      href: "/biblioteca/kyc/documentos",
      icon: <IconFileText className="size-5" />,
      count: "Repositorio",
    },
    {
      title: "AML y monitoreo",
      href: "/biblioteca/kyc/aml",
      icon: <IconAlertTriangle className="size-5" />,
      count: `${overview.escalated} escalados`,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="KYC y cumplimiento"
        description="Casos, reglas y revisión operativa conectadas por Gateway Admin."
        state={error ? "partial" : "connected"}
        percent={error ? 65 : 100}
        note="Casos, reglas y revisión consultados por Gateway Admin."
      />

      {error ? (
        <Card className="rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          KYC/Risk no respondió todavía. Revisa que el gateway admin y el motor KYC/Risk estén activos.
        </Card>
      ) : null}

      <StatsCards stats={overviewStats} />

      <div className="grid grid-cols-1 gap-4 @xl/page:grid-cols-2 @4xl/page:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="group h-full cursor-pointer rounded-[1.5rem] border bg-card/85 p-5 shadow-[0_16px_45px_rgb(15_23_42/0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgb(15_23_42/0.12)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border bg-background/80 p-3 text-primary">
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
              <h3 className="font-bold text-foreground">Casos recientes</h3>
              <p className="text-sm text-muted-foreground">Lectura conectada desde el motor KYC/Risk.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadKycRisk()} disabled={loading}>
              <IconRefresh className={cn("size-4", loading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
          {cases.length > 0 ? (
            <div className="space-y-3">
              {cases.slice(0, 5).map((item) => (
                <div key={item.caseId} className="rounded-2xl border bg-background/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.reason}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.userId} · {item.type.toUpperCase()} · {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={cn("rounded-full", severityClass[item.severity])}>{item.severity}</Badge>
                      <Badge variant="outline" className="rounded-full">{statusLabel[item.status]}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-background/60 p-6 text-sm text-muted-foreground">
              No hay casos KYC/Risk registrados en el micro todavía.
            </div>
          )}
        </Card>

        <Card className="rounded-[1.5rem] border bg-card/85 p-5 shadow-[0_16px_45px_rgb(15_23_42/0.08)] dark:bg-black/35 dark:shadow-[0_16px_45px_rgb(148_163_184/0.07)]">
          <h3 className="font-bold text-foreground">Reglas activas</h3>
          <p className="mt-1 text-sm text-muted-foreground">Motor inicial de cumplimiento.</p>
          <div className="mt-4 space-y-3">
            {rules.map((rule) => (
              <div key={rule.code} className="rounded-2xl border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{rule.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{rule.description}</p>
                  </div>
                  <Badge className={cn("rounded-full", severityClass[rule.severity])}>{rule.severity}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
