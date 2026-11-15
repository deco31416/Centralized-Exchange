"use client"

import React from "react"
import { Smartphone, Monitor, Clock, RefreshCw, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import type { SessionInfo } from "@/components/dashboard/types"

interface SessionCardProps {
  session: SessionInfo
  revoking: boolean
  onRevoke: (id: string) => void
}

export default function SessionCard({ session, revoking, onRevoke }: SessionCardProps) {
  const isMobile = /mobile|android|iphone/i.test(session.userAgent ?? "")
  const DeviceIcon = isMobile ? Smartphone : Monitor
  const lastUsed = session.lastUsed ?? session.createdAt

  return (
    <DashCard className={cn("flex items-start gap-4", session.current && "border-primary/40 bg-primary/5")}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">
            {session.device ?? (isMobile ? "Móvil" : "Escritorio")}
          </p>
          {session.current && (
            <Badge variant="secondary" className="text-xs text-primary border-primary/30 bg-primary/10">
              Sesión actual
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {session.ip && (
            <p className="text-xs text-muted-foreground">IP: {session.ip}</p>
          )}
          {lastUsed && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(lastUsed).toLocaleString("es-MX", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={revoking}
        onClick={() => onRevoke(session.sessionId)}
        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
      >
        {revoking
          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          : <><XCircle className="h-3.5 w-3.5 mr-1" />Cerrar</>}
      </Button>
    </DashCard>
  )
}
