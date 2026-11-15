"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/p2p/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Link2,
  Copy,
  CheckCheck,
  Users,
  DollarSign,
  UserCheck,
  Share2,
  ChevronRight,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"

interface ReferralStats {
  total: number
  active: number
  pending: number
  earned: number
  currency: string
}

interface ReferredUser {
  id: string
  name: string
  joinedAt: string
  status: "active" | "pending"
  earned: number
  currency: string
}

/** Genera el código de referido desde el userId: primeros 8 chars en mayúscula */
function buildRefCode(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase()
}

export default function TabReferidos() {
  const { user } = useAuth()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referred, setReferred] = useState<ReferredUser[]>([])
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const id = d?.userId ?? d?.user?.id ?? d?.id ?? null
        setUserId(id)
        // Intentar endpoint de referidos (puede no existir aún)
        if (id) {
          return fetch("/api/referrals/stats", { credentials: "include" })
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
              if (data) {
                setStats(data.stats ?? null)
                setReferred(data.referred ?? [])
              } else {
                setApiError(true)
              }
            })
            .catch(() => setApiError(true))
        }
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false))
  }, [])

  const refCode = userId ? buildRefCode(userId) : null
  const referralUrl = refCode
    ? `${typeof window !== "undefined" ? window.location.origin : "https://deco-exchange.com"}/register?ref=${refCode}`
    : null

  async function handleCopy() {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement("textarea")
      el.value = referralUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleShare() {
    if (!referralUrl) return
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "Únete a deco-exchange",
        text: "Regístrate en deco-exchange con mi enlace y empieza a operar.",
        url: referralUrl,
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <DashCard>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Programa de Referidos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comparte tu enlace. Cuando alguien se registre y opere, tú acumulas comisiones.
            </p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">Beta</Badge>
        </div>
      </DashCard>

      {/* Enlace de referido */}
      <DashCard>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-medium">
          Tu enlace de referido
        </p>

        {loading ? (
          <Skeleton className="h-10 w-full rounded-lg" />
        ) : referralUrl ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm font-mono text-foreground overflow-hidden">
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{referralUrl}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={cn("gap-2 transition-all", copied && "text-green-500 border-green-500/40")}
              >
                {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No se pudo generar el enlace. Intenta de nuevo.</p>
        )}

        {refCode && (
          <p className="text-xs text-muted-foreground mt-2">
            Código: <span className="font-mono font-semibold text-foreground">{refCode}</span>
          </p>
        )}
      </DashCard>

      {/* Stats */}
      {apiError ? (
        <DashCard>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-yellow-500" />
            <div>
              <p className="font-medium text-foreground">Estadísticas no disponibles aún</p>
              <p className="mt-0.5">
                El módulo de seguimiento de referidos está en desarrollo. Tu enlace ya es válido y funciona — los datos se mostrarán aquí una vez que el sistema esté activo.
              </p>
            </div>
          </div>
        </DashCard>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon={Users}
            label="Referidos totales"
            value={String(stats.total)}
          />
          <StatCard
            icon={UserCheck}
            label="Activos"
            value={String(stats.active)}
            highlight
          />
          <StatCard
            icon={DollarSign}
            label="Comisiones acumuladas"
            value={`${stats.currency} ${stats.earned.toFixed(2)}`}
            highlight
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={Users}      label="Referidos totales"       value="—" />
          <StatCard icon={UserCheck}  label="Activos"                 value="—" />
          <StatCard icon={DollarSign} label="Comisiones acumuladas"   value="—" />
        </div>
      )}

      {/* Tabla de referidos */}
      <DashCard>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4 font-medium">
          Mis referidos
        </p>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : referred.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-3">
            <Users className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aún no tienes referidos registrados.
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Comparte tu enlace y cuando alguien se registre aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {referred.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-3 gap-3 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.joinedAt).toLocaleDateString("es-MX", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={r.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {r.status === "active" ? "Activo" : "Pendiente"}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    +{r.currency} {r.earned.toFixed(2)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </div>
            ))}
          </div>
        )}
      </DashCard>

      {/* Cómo funciona */}
      <DashCard>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4 font-medium">
          Cómo funciona
        </p>
        <ol className="flex flex-col gap-3">
          {[
            { n: "1", text: "Copia tu enlace de referido único." },
            { n: "2", text: "Compártelo con amigos, en redes sociales o comunidades." },
            { n: "3", text: "Cuando se registren y operen, ambos obtienen beneficios." },
            { n: "4", text: "Tus comisiones se acumulan y puedes retirarlas desde tu wallet." },
          ].map(({ n, text }) => (
            <li key={n} className="flex items-start gap-3 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                {n}
              </span>
              <span className="text-muted-foreground pt-0.5">{text}</span>
            </li>
          ))}
        </ol>
      </DashCard>

    </div>
  )
}

// ─── Sub-componente local ────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn("text-xl font-bold", highlight ? "text-foreground" : "text-muted-foreground")}>
        {value}
      </p>
    </div>
  )
}
