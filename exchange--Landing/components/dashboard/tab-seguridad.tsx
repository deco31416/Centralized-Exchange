"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Shield, RefreshCw, AlertTriangle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import SessionCard from "@/components/dashboard/session-card"
import type { SessionInfo } from "@/components/dashboard/types"

export default function TabSeguridad() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch("/api/auth/sessions", { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => setSessions(d.sessions ?? d ?? []))
      .catch(() => setError("No se pudieron cargar las sesiones"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  async function handleRevoke(sessionId: string) {
    setRevoking(sessionId)
    try {
      const r = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (r.ok) {
        const data = await r.json()
        setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
        if (data?.wasCurrentSession) window.location.href = "/"
      }
    } catch {
      // silencio — no hay toaster en este diseño
    } finally {
      setRevoking(null)
    }
  }

  async function handleRevokeAll() {
    setRevoking("all")
    try {
      await fetch("/api/auth/sessions", { method: "DELETE", credentials: "include" })
      window.location.href = "/"
    } catch {
      setRevoking(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <DashCard className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Sesiones activas</p>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando…" : `${sessions.length} sesión${sessions.length !== 1 ? "es" : ""}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={loadSessions} disabled={loading} className="h-8 w-8">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAll}
              disabled={revoking === "all"}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Cerrar todas
            </Button>
          )}
        </div>
      </DashCard>

      {error && (
        <DashCard className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />{error}
          </p>
        </DashCard>
      )}

      <div className="flex flex-col gap-3">
        {loading
          ? [1, 2, 3].map((i) => (
              <DashCard key={i}>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              </DashCard>
            ))
          : sessions.map((session) => (
              <SessionCard
                key={session.sessionId}
                session={session}
                revoking={revoking === session.sessionId}
                onRevoke={handleRevoke}
              />
            ))}
        {!loading && sessions.length === 0 && (
          <DashCard className="text-center py-10">
            <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay sesiones activas</p>
          </DashCard>
        )}
      </div>
    </div>
  )
}
