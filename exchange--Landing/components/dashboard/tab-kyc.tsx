"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  ShieldCheck, Mail, Phone, Fingerprint, Lock,
  CheckCircle, XCircle, AlertTriangle, Star, RefreshCw,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"

interface KycBaseData {
  status: string
  is_email_verified: boolean
  has_mfa: boolean
}

interface KycProfileData {
  phone?: string
  smsOtpEnabled?: boolean
}

interface KycSigData {
  hasSignature?: boolean
  hasPIN?: boolean
}

const LEVELS = [
  {
    id: 1,
    label: "Nivel 1 — Básico",
    desc: "Cuenta creada y email verificado",
    icon: Mail,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    check: (k: KycBaseData, _p: KycProfileData, _s: KycSigData) =>
      k.is_email_verified || k.status === "active",
    action: null,
  },
  {
    id: 2,
    label: "Nivel 2 — Estándar",
    desc: "Teléfono registrado y verificación SMS activa",
    icon: Phone,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    check: (_k: KycBaseData, p: KycProfileData, _s: KycSigData) =>
      !!p.phone && !!p.smsOtpEnabled,
    action: "Activa SMS OTP en Seguridad",
  },
  {
    id: 3,
    label: "Nivel 3 — Avanzado",
    desc: "Autenticación de dos factores (MFA / TOTP) activa",
    icon: Fingerprint,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    check: (k: KycBaseData, _p: KycProfileData, _s: KycSigData) => k.has_mfa,
    action: "Configura MFA en Seguridad",
  },
  {
    id: 4,
    label: "Nivel 4 — Pro",
    desc: "PIN de firma de operaciones configurado",
    icon: Lock,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    check: (_k: KycBaseData, _p: KycProfileData, s: KycSigData) =>
      !!(s.hasPIN || s.hasSignature),
    action: "Crea tu PIN en Firma / PIN",
  },
] as const

const LEVEL_LABELS = ["Sin verificar", "Básico", "Estándar", "Avanzado", "Pro"]
const LEVEL_COLORS = [
  "bg-muted",
  "bg-blue-400",
  "bg-yellow-400",
  "bg-orange-400",
  "bg-green-400",
]

export default function TabKyc() {
  const [base, setBase] = useState<KycBaseData | null>(null)
  const [profile, setProfile] = useState<KycProfileData | null>(null)
  const [sig, setSig] = useState<KycSigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [meRes, profileRes, sigRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/profile", { credentials: "include" }),
        fetch("/api/signature/status", { credentials: "include" }),
      ])

      const me = meRes.ok ? await meRes.json() : null
      const prof = profileRes.ok ? await profileRes.json() : null
      const sigData = sigRes.ok ? await sigRes.json() : {}

      if (!me) throw new Error("No se pudo cargar la información de cuenta")

      // me puede tener shape { user: {...} } o directo
      const user = me.user ?? me
      setBase({
        status: user.status ?? "active",
        is_email_verified: user.is_email_verified ?? true,
        has_mfa: user.has_mfa ?? false,
      })
      setProfile({
        phone: prof?.phone,
        smsOtpEnabled: prof?.smsOtpEnabled ?? false,
      })
      setSig(sigData ?? {})
    } catch {
      setError("No se pudo cargar el estado de verificación")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const currentLevel =
    base && profile && sig
      ? LEVELS.filter((l) => l.check(base, profile, sig)).length
      : 0

  const progressPct = Math.round((currentLevel / LEVELS.length) * 100)

  return (
    <div className="flex flex-col gap-5">

      {/* Encabezado */}
      <DashCard className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Verificación y nivel de cuenta</p>
          <p className="text-xs text-muted-foreground">
            Completa los pasos para desbloquear mayor capacidad operativa y límites más altos
          </p>
        </div>
        {!loading && (
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-foreground leading-tight">
              {currentLevel}
              <span className="text-sm font-normal text-muted-foreground">/{LEVELS.length}</span>
            </p>
            <p className={cn("text-xs font-medium", LEVEL_COLORS[currentLevel].replace("bg-", "text-"))}>
              {LEVEL_LABELS[currentLevel]}
            </p>
          </div>
        )}
      </DashCard>

      {error && (
        <DashCard className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={load} className="ml-auto flex items-center gap-1 text-xs underline opacity-70 hover:opacity-100">
              <RefreshCw className="h-3 w-3" />Reintentar
            </button>
          </p>
        </DashCard>
      )}

      {/* Barra de progreso */}
      {!loading && !error && (
        <DashCard>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">Progreso de verificación</p>
            <p className="text-xs text-muted-foreground">{progressPct}% completado</p>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                currentLevel === 4
                  ? "bg-green-400"
                  : currentLevel === 3
                    ? "bg-orange-400"
                    : currentLevel >= 2
                      ? "bg-yellow-400"
                      : "bg-blue-400"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {LEVELS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i < currentLevel ? LEVEL_COLORS[currentLevel] : "bg-muted-foreground/20"
                )}
              />
            ))}
          </div>
        </DashCard>
      )}

      {/* Tarjetas de nivel */}
      <div className="flex flex-col gap-3">
        {LEVELS.map((level) => {
          const Icon = level.icon
          const achieved =
            !loading && base && profile && sig
              ? level.check(base, profile, sig)
              : false

          return (
            <DashCard
              key={level.id}
              className={cn(
                "transition-all duration-200",
                achieved ? cn("border", level.borderColor) : "opacity-55"
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-36 mb-1.5" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                      achieved ? level.bgColor : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", achieved ? level.color : "text-muted-foreground")}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          achieved ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {level.label}
                      </p>
                      {achieved && (
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{level.desc}</p>
                    {!achieved && level.action && (
                      <p className="text-xs text-primary mt-0.5">→ {level.action}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {achieved ? (
                      <CheckCircle className={cn("h-5 w-5", level.color)} />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
              )}
            </DashCard>
          )
        })}
      </div>

      {/* Estado general */}
      {!loading && base && (
        <DashCard className="bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-2">Estado de la cuenta</p>
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                base.status === "active"
                  ? "bg-green-400/10 text-green-400"
                  : "bg-yellow-400/10 text-yellow-400"
              )}
            >
              {base.status === "active" ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {base.status === "active"
                ? "Activa"
                : base.status === "pending_verification"
                  ? "Pendiente de verificación"
                  : base.status}
            </span>

            {base.is_email_verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-blue-400/10 text-blue-400">
                <Mail className="h-3 w-3" />
                Email verificado
              </span>
            )}

            {base.has_mfa && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-orange-400/10 text-orange-400">
                <Fingerprint className="h-3 w-3" />
                MFA activo
              </span>
            )}
          </div>
        </DashCard>
      )}
    </div>
  )
}
