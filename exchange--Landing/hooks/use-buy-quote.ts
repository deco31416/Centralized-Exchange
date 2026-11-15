"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Quote estructurado devuelto por POST /api/v1/quotes del pricing-aggregator.
 * Incluye fees reales calculados según el fee schedule del micro.
 */
export interface BuyQuote {
  quoteId: string
  operation: string
  fromAsset: string
  toAsset: string
  fromAmount: number
  exchangeRate: number
  toAmountBeforeFees: number
  fees: {
    platformFee?: { value: number; type: string }
    networkFee?: { value: number; type: string }
    total: number
  }
  toAmountAfterFees: number
  pricingSource: string
  expiresAt: string
  used: boolean
  createdAt: string
}

interface BuyQuoteState {
  data: BuyQuote | null
  loading: boolean
  error: string | null
}

/**
 * Obtiene un quote estructurado con fees reales desde el BFF quotes endpoint.
 * Solo solicita si fromAsset, toAsset y fromAmount > 0 están definidos.
 *
 * Diferencia con useQuote (use-quote.ts):
 *   - useQuote: GET /prices/convert → resultado simple, sin fees
 *   - useBuyQuote: POST /quotes → quoteId + fees reales + TTL de 120s
 */
export function useBuyQuote(
  fromAsset: string,
  toAsset: string,
  fromAmount: number,
  userId?: string,
) {
  const [state, setState] = useState<BuyQuoteState>({ data: null, loading: false, error: null })
  const abortRef = useRef<AbortController | null>(null)

  const fetchQuote = useCallback(
    async (from: string, to: string, amount: number, uid?: string) => {
      if (!from || !to || amount <= 0) {
        setState({ data: null, loading: false, error: null })
        return
      }

      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          signal: abortRef.current.signal,
          body: JSON.stringify({
            operation: 'BUY',
            fromAsset: from,
            toAsset: to,
            fromAmount: amount,
            ...(uid ? { userId: uid } : {}),
          }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message ?? `Error ${res.status}`)
        }

        const data: BuyQuote = await res.json()
        setState({ data, loading: false, error: null })
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return
        setState({
          data: null,
          loading: false,
          error: (err as Error).message || 'Error al obtener cotización',
        })
      }
    },
    [],
  )

  useEffect(() => {
    if (!fromAsset || !toAsset || fromAmount <= 0) {
      setState({ data: null, loading: false, error: null })
      return
    }

    // Debounce 800ms: cancela el request anterior si el input cambia rápido
    const timer = setTimeout(() => {
      fetchQuote(fromAsset, toAsset, fromAmount, userId)
    }, 800)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [fromAsset, toAsset, fromAmount, userId, fetchQuote])

  const refresh = useCallback(
    () => fetchQuote(fromAsset, toAsset, fromAmount, userId),
    [fromAsset, toAsset, fromAmount, userId, fetchQuote],
  )

  return { ...state, refresh }
}
