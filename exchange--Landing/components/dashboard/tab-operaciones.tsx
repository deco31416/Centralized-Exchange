"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Activity, RefreshCw, AlertTriangle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import MovementRow from "@/components/dashboard/movement-row"
import type { Movement } from "@/components/dashboard/types"

const LIMIT = 10

export default function TabOperaciones() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const load = useCallback((p: number) => {
    setLoading(true)
    setError(null)
    fetch(`/api/movements?page=${p}&limit=${LIMIT}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: { data: Movement[]; total?: number }) => {
        const items = d.data ?? []
        if (p === 1) {
          setMovements(items)
        } else {
          setMovements((prev) => [...prev, ...items])
        }
        setHasMore(items.length === LIMIT)
      })
      .catch(() => setError("No se pudieron cargar los movimientos"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(1) }, [load])

  function loadMore() {
    const next = page + 1
    setPage(next)
    load(next)
  }

  return (
    <div className="flex flex-col gap-5">
      <DashCard className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Historial de operaciones</p>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando…" : `${movements.length} registro${movements.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setPage(1); load(1) }}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </DashCard>

      {error && (
        <DashCard className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />{error}
          </p>
        </DashCard>
      )}

      <div className="flex flex-col gap-2">
        {loading && movements.length === 0
          ? [1, 2, 3, 4, 5].map((i) => (
              <DashCard key={i}>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              </DashCard>
            ))
          : movements.map((m) => (
              <MovementRow key={m._id} movement={m} />
            ))}
        {!loading && movements.length === 0 && (
          <DashCard className="text-center py-10">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Sin operaciones registradas</p>
          </DashCard>
        )}
      </div>

      {!loading && hasMore && movements.length > 0 && (
        <Button variant="outline" size="sm" onClick={loadMore} className="self-center">
          <ChevronDown className="h-4 w-4 mr-1" />
          Cargar más
        </Button>
      )}
    </div>
  )
}
