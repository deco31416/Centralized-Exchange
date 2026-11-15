"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCw, Clock, AlertTriangle } from "lucide-react"
import type { BuyQuote } from "@/hooks/use-buy-quote"
import { getAssetIconUrl } from "@/lib/assets/get-asset-icon-url"

interface BuyQuotePreviewCardProps {
  from: string
  to: string
  quote: BuyQuote | null
  loading: boolean
  error?: string | null
  onRefresh?: () => void
  /** Callback ejecutado cuando el quote expira (segundos restantes llegan a 0). */
  onExpired?: () => void
}

/**
 * Muestra el quote estructurado con fees reales desde pricing-aggregator.
 * Incluye countdown en tiempo real que llama onExpired() al vencer.
 */
export function BuyQuotePreviewCard({
  from,
  to,
  quote,
  loading,
  error,
  onRefresh,
  onExpired,
}: BuyQuotePreviewCardProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [expired, setExpired] = useState(false)

  // Countdown en tiempo real
  useEffect(() => {
    if (!quote?.expiresAt) {
      setSecondsLeft(0)
      setExpired(false)
      return
    }

    const computeRemaining = () =>
      Math.max(0, Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000))

    setSecondsLeft(computeRemaining())
    setExpired(computeRemaining() <= 0)

    const id = setInterval(() => {
      const remaining = computeRemaining()
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        setExpired(true)
        clearInterval(id)
        onExpired?.()
      }
    }, 1000)

    return () => clearInterval(id)
  }, [quote?.expiresAt, onExpired])
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Obteniendo cotización…</span>
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

  if (!quote) return null

  const platformFee = quote.fees?.platformFee?.value ?? 0
  const platformFeeType = quote.fees?.platformFee?.type ?? "NONE"
  const totalFee = quote.fees?.total ?? 0

  const expiresAt = new Date(quote.expiresAt)
  const fromIcon = getAssetIconUrl(from)
  const toIcon = getAssetIconUrl(to)

  if (expired) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Cotización expirada. Actualiza el monto para continuar.</span>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="mt-2 flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition"
          >
            <RefreshCw className="h-3 w-3" />
            Nueva cotización
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Cotización
        </span>
        <div className="flex items-center gap-3">
          {secondsLeft > 0 && (
            <span className={`flex items-center gap-1 text-xs ${secondsLeft <= 10 ? 'text-amber-500' : 'text-amber-500/80'}`}>
              <Clock className="h-3 w-3" />
              {secondsLeft}s
            </span>
          )}
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
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pagas</span>
          <span className="font-semibold inline-flex items-center gap-2">
            <img src={fromIcon} alt={from} className="rounded-full h-6 w-6 object-contain bg-white/10 border border-white/10" />
            {quote.fromAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })} {from}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Recibes (estimado)</span>
          <span className="font-bold text-primary inline-flex items-center gap-2">
            <img src={toIcon} alt={to} className="rounded-full h-6 w-6 object-contain bg-white/10 border border-white/10" />
            {quote.toAmountAfterFees.toLocaleString(undefined, { maximumFractionDigits: 8 })} {to}
          </span>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-2">
          <span>Tasa de cambio</span>
          <span>
            1 {from} = {quote.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 8 })} {to}
          </span>
        </div>

        {platformFeeType !== "NONE" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Tarifa plataforma
              {platformFeeType === "PERCENTAGE" && (
                <span className="ml-1 text-muted-foreground/60">
                  ({((platformFee / quote.toAmountBeforeFees) * 100).toFixed(2)}%)
                </span>
              )}
            </span>
            <span>
              {platformFee.toLocaleString(undefined, { maximumFractionDigits: 8 })} {to}
            </span>
          </div>
        )}

        {totalFee > 0 && platformFeeType === "NONE" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Comisión total</span>
            <span>{totalFee.toLocaleString(undefined, { maximumFractionDigits: 8 })} {to}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/50 leading-tight">
        Cotización con ID <span className="font-mono">{quote.quoteId.split('-')[0]}…</span> — válida hasta{' '}
        {expiresAt.toLocaleTimeString()}. La tasa puede variar al confirmar.
      </p>
    </div>
  )
}
