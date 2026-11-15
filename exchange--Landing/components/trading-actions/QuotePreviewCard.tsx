"use client"

import { Loader2, RefreshCw } from "lucide-react"

interface QuotePreviewCardProps {
  from: string
  to: string
  amount: number
  result: number
  rate: number
  timestamp?: string
  loading: boolean
  error?: string | null
  onRefresh?: () => void
}

export function QuotePreviewCard({
  from,
  to,
  amount,
  result,
  rate,
  timestamp,
  loading,
  error,
  onRefresh,
}: QuotePreviewCardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Obteniendo cotización en tiempo real…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Vista previa de cotización
        </span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <RefreshCw className="h-3 w-3" />
            Actualizar
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pagas</span>
          <span className="font-semibold">
            {amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} {from}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Recibes (estimado)</span>
          <span className="font-bold text-primary">
            {result.toLocaleString(undefined, { maximumFractionDigits: 8 })} {to}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-2">
          <span>Tasa</span>
          <span>
            1 {from} = {rate.toLocaleString(undefined, { maximumFractionDigits: 8 })} {to}
          </span>
        </div>
        {timestamp && (
          <p className="text-xs text-muted-foreground/60 text-right">
            Cotización al {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/50 leading-tight">
        Cotización en tiempo real desde pricing-aggregator. La tasa puede variar al confirmar.
      </p>
    </div>
  )
}
