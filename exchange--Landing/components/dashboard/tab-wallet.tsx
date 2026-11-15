"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Wallet, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import BalanceCard from "@/components/dashboard/balance-card"
import type { WalletData, WalletBalance, FundingChannel } from "@/components/dashboard/types"

interface CatalogAsset {
  code: string
  type: string
  isVisibleInFrontend: boolean
  fundingChannels?: FundingChannel[]
}

interface CatalogGrouped {
  fiat: CatalogAsset[]
  crypto: CatalogAsset[]
  internal: CatalogAsset[]
}

function buildBaseBalances(catalog: CatalogGrouped): Array<{ currency: string; type: "fiat" | "crypto" }> {
  return [
    ...catalog.fiat.map((a) => ({ currency: a.code, type: 'fiat' as const })),
    ...catalog.crypto.map((a) => ({ currency: a.code, type: 'crypto' as const })),
  ]
}

type CatalogStatus = 'loading' | 'ok' | 'error'

// Monedas fiat conocidas en el ecosistema (fuente: currency-meta del wallet-ledger)
const FIAT_CURRENCIES = new Set(['MXN', 'USD', 'COP', 'PEN', 'SVC', 'BLC', 'ARS', 'CLP', 'EUR', 'VES', 'BRL'])

// Catálogo de fallback: se usa cuando el asset-registry no responde.
// Fuente de verdad: Exchange--micro-wallet-ledger-core/src/shared/money/currency-meta.ts
const FALLBACK_CATALOG: CatalogGrouped = {
  fiat: [
    { code: 'MXN', type: 'fiat', isVisibleInFrontend: true },
    { code: 'USD', type: 'fiat', isVisibleInFrontend: true },
    { code: 'COP', type: 'fiat', isVisibleInFrontend: true },
    { code: 'PEN', type: 'fiat', isVisibleInFrontend: true },
    { code: 'SVC', type: 'fiat', isVisibleInFrontend: true },
    { code: 'BLC', type: 'fiat', isVisibleInFrontend: true },
    { code: 'ARS', type: 'fiat', isVisibleInFrontend: true },
    { code: 'CLP', type: 'fiat', isVisibleInFrontend: true },
    { code: 'EUR', type: 'fiat', isVisibleInFrontend: true },
    { code: 'VES', type: 'fiat', isVisibleInFrontend: true },
    { code: 'BRL', type: 'fiat', isVisibleInFrontend: true },
  ],
  crypto: [
    { code: 'BTC',      type: 'crypto', isVisibleInFrontend: true },
    { code: 'ETH',      type: 'crypto', isVisibleInFrontend: true },
    { code: 'BNB',      type: 'crypto', isVisibleInFrontend: true },
    { code: 'USDT',     type: 'crypto', isVisibleInFrontend: true },
    { code: 'USDC',     type: 'crypto', isVisibleInFrontend: true },
    { code: 'DECOX',     type: 'crypto', isVisibleInFrontend: true },
    { code: 'DECO',      type: 'crypto', isVisibleInFrontend: true },
  ],
  internal: [],
}

// Normaliza la respuesta cruda de wallet-ledger al tipo WalletBalance del frontend.
// La API devuelve availableMinorUnits (string entero) y availableFormatted (decimal string).
// NO tiene campo 'type' → se infiere por moneda.
function normalizeWalletResponse(raw: { accountNumber?: string; balances?: unknown[] }): { accountNumber?: string; balances: WalletBalance[] } {
  const balances = ((raw.balances ?? []).map((b: unknown) => {
    const entry = b as Record<string, string>
    const currency = String(entry.currency ?? '').toUpperCase()
    const type = FIAT_CURRENCIES.has(currency) ? 'fiat' as const : 'crypto' as const
    // availableFormatted es "1234.56" — sin separador de miles, punto decimal
    const available = Number(entry.availableFormatted ?? entry.availableMinorUnits ?? '0') || 0
    const locked = Number(entry.lockedFormatted ?? entry.lockedMinorUnits ?? '0') || 0
    return { currency, available, locked, type }
  })) as unknown as WalletBalance[]
  return { accountNumber: raw.accountNumber, balances }
}

function mergeBalances(
  apiBalances: WalletBalance[] | undefined,
  catalog: CatalogGrouped | null,
  catalogStatus: CatalogStatus,
): WalletBalance[] {
  // Cuando el catálogo falla, se usa el fallback local (currency-meta del wallet-ledger).
  // NUNCA se inventan tasas ni datos financieros — solo la lista de monedas conocidas.
  const activeCatalog = catalogStatus === 'ok' && catalog ? catalog : FALLBACK_CATALOG
  const base = buildBaseBalances(activeCatalog)
  const result: WalletBalance[] = base.map(({ currency, type }) => {
    const found = apiBalances?.find((b) => b.currency === currency)
    return found ?? ({ currency, type, available: 0, locked: 0 } as WalletBalance)
  })
  const extra = (apiBalances ?? []).filter(
    (b) => !base.some((s) => s.currency === b.currency)
  )
  return [...result, ...extra]
}

type FilterMode = 'withBalance' | 'all'

export default function TabWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<CatalogGrouped | null>(null)
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>('loading')
  const [filterMode, setFilterMode] = useState<FilterMode>('withBalance')

  useEffect(() => {
    fetch('/api/catalog/assets/grouped', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d) => { setCatalog(d); setCatalogStatus('ok') })
      .catch(() => { setCatalogStatus('error') })
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch("/api/wallet/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => setWallet(normalizeWalletResponse(d)))
      .catch(() => setError("No se pudo cargar el wallet"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Mapa de fundingChannels por código de moneda — construido desde el catálogo del backend.
  // Permite pasar los canales de fondeo dinámicos a cada BalanceCard sin hardcodear datos.
  const catalogChannelsMap = React.useMemo<Record<string, FundingChannel[]>>(() => {
    if (!catalog) return {}
    const map: Record<string, FundingChannel[]> = {}
    ;[...catalog.fiat, ...catalog.crypto, ...catalog.internal].forEach((a) => {
      if (a.fundingChannels?.length) map[a.code] = a.fundingChannels
    })
    return map
  }, [catalog])

  const allBalances = mergeBalances(wallet?.balances, catalog, catalogStatus)
  const fiatBalances = allBalances.filter((b) => b.type === "fiat")
  const cryptoBalances = allBalances.filter((b) => b.type === "crypto")

  const displayedFiat = filterMode === 'withBalance' ? fiatBalances.filter((b) => b.available > 0) : fiatBalances
  const displayedCrypto = filterMode === 'withBalance' ? cryptoBalances.filter((b) => b.available > 0) : cryptoBalances

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <DashCard className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Mi Wallet</p>
            {wallet?.accountNumber ? (
              <p className="text-xs text-muted-foreground font-mono">{wallet.accountNumber}</p>
            ) : !loading ? (
              <p className="text-xs text-muted-foreground">Cuenta interna deco-exchange</p>
            ) : (
              <Skeleton className="h-3 w-32 mt-0.5" />
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="h-8 w-8">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </DashCard>

      {catalogStatus === 'error' && (
        <DashCard className="border-yellow-500/30 bg-yellow-500/5">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Catálogo de activos no disponible — usando lista de monedas conocidas
          </p>
        </DashCard>
      )}

      {error && (
        <DashCard className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />{error}
          </p>
        </DashCard>
      )}

      {/* Toggle Con saldo / Todas */}
      {!loading && (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border w-fit">
          <button
            onClick={() => setFilterMode('withBalance')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              filterMode === 'withBalance'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Con saldo
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              filterMode === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Todas
          </button>
        </div>
      )}

      {/* Balances fiat */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Monedas fiat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <DashCard key={i}>
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-8 w-28" />
                </DashCard>
              ))
            : displayedFiat.length === 0
              ? (
                <p className="text-xs text-muted-foreground col-span-full py-2">
                  {filterMode === 'withBalance' ? 'Ninguna moneda fiat tiene saldo.' : 'No hay monedas fiat disponibles.'}
                </p>
              )
              : displayedFiat.map((b) => (
                <BalanceCard
                  key={b.currency}
                  balance={b}
                  accountNumber={wallet?.accountNumber}
                  onBalanceUpdated={load}
                  fundingChannels={catalogChannelsMap[b.currency]}
                />
              ))}
        </div>
      </div>

      {/* Balances crypto */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Criptomonedas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading
            ? [1, 2, 3, 4, 5].map((i) => (
                <DashCard key={i}>
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-8 w-28" />
                </DashCard>
              ))
            : displayedCrypto.length === 0
              ? (
                <p className="text-xs text-muted-foreground col-span-full py-2">
                  {filterMode === 'withBalance' ? 'Ninguna criptomoneda tiene saldo.' : 'No hay criptomonedas disponibles.'}
                </p>
              )
              : displayedCrypto.map((b) => (
                <BalanceCard
                  key={b.currency}
                  balance={b}
                  accountNumber={wallet?.accountNumber}
                  onBalanceUpdated={load}
                  fundingChannels={catalogChannelsMap[b.currency]}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
