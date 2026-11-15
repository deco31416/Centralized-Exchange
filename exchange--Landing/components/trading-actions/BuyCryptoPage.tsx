"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, CreditCard, Loader2, ReceiptText, ShieldCheck, TrendingUp } from "lucide-react"

import { useAuth } from "@/components/p2p/use-auth"
import {
  EasyCryptoConfirmModal,
  EasyCryptoHero,
  EasyCryptoHeroStat,
  EasyCryptoMethodGrid,
  EasyCryptoMetricCard,
  EasyCryptoPanel,
  EasyCryptoSummary,
} from "@/components/easy-crypto/easy-crypto-components"
import { useAllAssets, useQuote } from "@/hooks/use-quote"
import { useBuyQuote } from "@/hooks/use-buy-quote"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { AssetAmountInput } from "@/components/trading-actions/AssetAmountInput"
import { BuyQuotePreviewCard } from "@/components/trading-actions/BuyQuotePreviewCard"
import {
  EasyCryptoBuyService,
  type BuyConfirmationResult,
  type BuyIntentResult,
  type FundingMethod,
} from "@/services/EasyCryptoBuyService"

type BuyState =
  | "IDLE"
  | "CREATING_INTENT"
  | "INTENT_READY"
  | "CONFIRMING"
  | "COMPLETED"
  | "FAILED"

export default function BuyCryptoPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { cryptoAssets, fiatAssets, loading: assetsLoading } = useAllAssets()

  const [fiatAmount, setFiatAmount] = useState("")
  const [fiatCurrency, setFiatCurrency] = useState("MXN")
  const [cryptoCurrency, setCryptoCurrency] = useState("BTC")
  const [paymentMethods, setPaymentMethods] = useState<FundingMethod[]>([])
  const [methodsLoading, setMethodsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<FundingMethod | null>(null)
  const [methodQuery, setMethodQuery] = useState("")
  const [reviewOpen, setReviewOpen] = useState(false)
  const [buyState, setBuyState] = useState<BuyState>("IDLE")
  const [intent, setIntent] = useState<BuyIntentResult | null>(null)
  const [confirmation, setConfirmation] = useState<BuyConfirmationResult | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [quoteExpired, setQuoteExpired] = useState(false)
  const [blcBalance, setBlcBalance] = useState(0)
  const [blcBalanceLoading, setBlcBalanceLoading] = useState(false)

  const parsedAmount = parseFloat(fiatAmount) || 0
  const { data: buyQuote, loading: quoteLoading, error: quoteError, refresh } = useBuyQuote(
    fiatCurrency,
    cryptoCurrency,
    parsedAmount,
    user?.id,
  )
  const { data: priceRef } = useQuote(cryptoCurrency, fiatCurrency, 1)
  const canShowQuote = parsedAmount > 0
  const isBlcFiat = fiatCurrency.toUpperCase() === "BLC"
  const isBlcBalanceSufficient = blcBalance >= parsedAmount && parsedAmount > 0
  const filteredMethods = paymentMethods.filter((method) => {
    const query = methodQuery.trim().toLowerCase()
    return !query || method.name.toLowerCase().includes(query) || method.description.toLowerCase().includes(query) || method.currency.toLowerCase().includes(query)
  })

  const resolveCountryByFiat = (fiat: string): string | undefined => {
    const map: Record<string, string> = {
      ARS: "AR",
      BRL: "BR",
      CLP: "CL",
      COP: "CO",
      EUR: "EU",
      GBP: "GB",
      MXN: "MX",
      PEN: "PE",
      SVC: "SV",
      USD: "US",
      VES: "VE",
    }
    return map[fiat.toUpperCase()]
  }

  const loadPaymentMethods = useCallback(async (fiatCode: string) => {
    setMethodsLoading(true)
    try {
      const methods = await EasyCryptoBuyService.getPaymentMethods({
        fiat: fiatCode,
        country: resolveCountryByFiat(fiatCode),
      })
      setPaymentMethods(methods)
      setSelectedMethod((current) => {
        if (current && methods.some((method) => (method.methodCode ?? method.code) === (current.methodCode ?? current.code) && method.currency === current.currency)) {
          return current
        }
        return methods.find((method) => method.enabled) ?? null
      })
    } catch {
      setPaymentMethods([])
      setSelectedMethod(null)
    } finally {
      setMethodsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPaymentMethods(fiatCurrency)
  }, [fiatCurrency, loadPaymentMethods])

  useEffect(() => {
    if (!isBlcFiat || !user?.id) return
    setBlcBalanceLoading(true)
    fetch("/api/wallet/wallets/user/me", { credentials: "include", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((wallet) => {
        const balances = Array.isArray(wallet?.balances) ? wallet.balances : []
        const blc = balances.find((balance: { currency?: string; available?: number }) => (balance.currency || "").toUpperCase() === "BLC")
        setBlcBalance(Number(blc?.available ?? 0))
      })
      .catch(() => setBlcBalance(0))
      .finally(() => setBlcBalanceLoading(false))
  }, [isBlcFiat, user?.id])

  useEffect(() => {
    if (!cryptoAssets.length) return
    const exists = cryptoAssets.some((asset) => asset.code === cryptoCurrency)
    if (!exists) setCryptoCurrency(cryptoAssets[0].code)
  }, [cryptoAssets, cryptoCurrency])

  useEffect(() => {
    if (!fiatAssets.length) return
    const exists = fiatAssets.some((asset) => asset.code === fiatCurrency)
    if (!exists) {
      const preferred = fiatAssets.find((asset) => !asset.isInternal) ?? fiatAssets[0]
      setFiatCurrency(preferred.code)
    }
  }, [fiatAssets, fiatCurrency])

  useEffect(() => {
    if (buyState !== "IDLE") {
      setBuyState("IDLE")
      setIntent(null)
      setConfirmation(null)
      setBuyError(null)
    }
    setQuoteExpired(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fiatAmount, fiatCurrency, cryptoCurrency])

  const handleQuoteExpired = useCallback(() => {
    setQuoteExpired(true)
    if (buyState === "INTENT_READY") {
      setBuyState("IDLE")
      setIntent(null)
    }
  }, [buyState])

  const handleCreateIntent = async () => {
    if (!selectedMethod || !buyQuote || !user) return
    setReviewOpen(true)
    setBuyState("CREATING_INTENT")
    setBuyError(null)
    try {
      const result = await EasyCryptoBuyService.createBuyIntent({
        method: selectedMethod.code,
        amount: parsedAmount,
        currency: fiatCurrency,
        quoteId: buyQuote.quoteId,
      })
      setIntent(result)
      setBuyState("INTENT_READY")
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : "Error al crear la intención de compra. Intenta de nuevo.")
      setBuyState("FAILED")
    }
  }

  const handleConfirmIntent = async () => {
    if (!intent || !selectedMethod) return
    setBuyState("CONFIRMING")
    setBuyError(null)
    try {
      const result = await EasyCryptoBuyService.confirmBuyIntent({
        intentId: intent.intentId,
        method: selectedMethod.code,
        amount: parsedAmount,
        currency: fiatCurrency,
        quoteId: buyQuote?.quoteId,
      })
      setConfirmation(result)
      setBuyState("COMPLETED")
      setReviewOpen(false)
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : "Error al confirmar la compra. Intenta de nuevo.")
      setBuyState("FAILED")
    }
  }

  const handleReset = () => {
    setBuyState("IDLE")
    setIntent(null)
    setConfirmation(null)
    setBuyError(null)
    setQuoteExpired(false)
    setReviewOpen(false)
    refresh()
  }

  const isConfirmDisabled =
    !user ||
    !selectedMethod ||
    !selectedMethod.enabled ||
    !buyQuote ||
    quoteExpired ||
    (isBlcFiat && !isBlcBalanceSufficient) ||
    parsedAmount <= 0 ||
    buyState === "CREATING_INTENT" ||
    buyState === "CONFIRMING" ||
    buyState === "COMPLETED"
  const isConfirming = buyState === "CONFIRMING"
  const isCreatingIntent = buyState === "CREATING_INTENT"

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section className="space-y-6">
          <EasyCryptoHero
            title="Compra cripto"
            description="Elige cuánto pagas, selecciona el activo que quieres recibir y confirma la cotización antes de comprar."
            aside={<EasyCryptoHeroStat label="Entrada simple" value="$1+" description="Compra desde montos pequeños, sujeto a método y país." />}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-5">
              <EasyCryptoPanel>
                <AssetAmountInput
                  label="Pagas"
                  amount={fiatAmount}
                  onAmountChange={setFiatAmount}
                  selectedAsset={fiatCurrency}
                  onAssetChange={setFiatCurrency}
                  assets={assetsLoading ? [{ code: fiatCurrency, label: fiatCurrency }] : fiatAssets}
                  placeholder="0.00"
                />

                <div className="my-4 flex justify-center">
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-black text-muted-foreground">→</span>
                </div>

                <AssetAmountInput
                  label="Recibes estimado"
                  amount={canShowQuote && buyQuote ? buyQuote.toAmountAfterFees.toLocaleString(undefined, { maximumFractionDigits: 8 }) : ""}
                  onAmountChange={() => {}}
                  selectedAsset={cryptoCurrency}
                  onAssetChange={setCryptoCurrency}
                  assets={assetsLoading ? [{ code: cryptoCurrency, label: cryptoCurrency }] : cryptoAssets}
                  disabled={false}
                  placeholder="—"
                />
              </EasyCryptoPanel>

              {isBlcFiat && (
                <div className="rounded-[var(--radius)] border border-amber-500/30 bg-amber-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Unidad interna deco-exchange</p>
                  <p className="mt-1 text-xs text-muted-foreground">BLC es saldo interno de plataforma. No es moneda fiat legal.</p>
                  <p className="mt-2 text-xs text-foreground">
                    Saldo BLC disponible: {blcBalanceLoading ? "Cargando..." : blcBalance.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {!isBlcBalanceSufficient && parsedAmount > 0 && (
                    <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-xs font-medium text-destructive">Saldo BLC insuficiente.</p>
                      <p className="mt-1 text-xs text-muted-foreground">Carga BLC desde tu Wallet para continuar.</p>
                      <Link href="/dashboard?tab=wallet" className="mt-2 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                        Ir a Wallet
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <EasyCryptoMethodGrid
                methods={filteredMethods}
                isLoading={methodsLoading}
                selectedMethod={selectedMethod}
                onSelect={setSelectedMethod}
                query={methodQuery}
                onQueryChange={setMethodQuery}
                emptyText={isBlcFiat ? "BLC usa saldo interno disponible en Wallet." : "No hay metodos disponibles para esta moneda."}
              />

              {canShowQuote && (
                <BuyQuotePreviewCard
                  from={fiatCurrency}
                  to={cryptoCurrency}
                  quote={buyQuote}
                  loading={quoteLoading}
                  error={quoteError}
                  onRefresh={refresh}
                  onExpired={handleQuoteExpired}
                />
              )}

              {buyState === "COMPLETED" && confirmation && (
                <div className="rounded-[var(--radius)] border border-green-500/30 bg-green-500/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-500">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Compra realizada exitosamente
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p>Referencia: <span className="font-mono text-foreground">{confirmation.fundingId}</span></p>
                    <p>Monto acreditado: <span className="font-semibold text-foreground">{confirmation.creditedAmount?.toLocaleString()} {fiatCurrency}</span></p>
                    <p>{confirmation.message}</p>
                  </div>
                  <button type="button" onClick={handleReset} className="mt-3 text-xs font-bold text-primary hover:text-primary/80">
                    Realizar otra compra
                  </button>
                </div>
              )}

              {buyState === "FAILED" && buyError && (
                <div className="rounded-[var(--radius)] border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Error al procesar la compra
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{buyError}</p>
                  <button type="button" onClick={handleReset} className="mt-3 text-xs font-bold text-primary hover:text-primary/80">
                    Intentar de nuevo
                  </button>
                </div>
              )}

            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <EasyCryptoSummary title="Resumen de compra" icon={<ReceiptText className="h-4 w-4 text-primary" />}>
            <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recibirás</p>
              <p className="mt-2 text-3xl font-black text-foreground">
                {buyQuote ? buyQuote.toAmountAfterFees.toLocaleString(undefined, { maximumFractionDigits: 8 }) : "0"} {cryptoCurrency}
              </p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Pagas", value: `${parsedAmount || 0} ${fiatCurrency}` },
                { label: "Método", value: selectedMethod?.name ?? "Selecciona método" },
                { label: "Tasa", value: buyQuote ? `1 ${fiatCurrency} = ${buyQuote.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${cryptoCurrency}` : "Pendiente" },
                { label: "Comisión", value: buyQuote ? `${(buyQuote.fees?.total ?? 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${cryptoCurrency}` : "Variable" },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="max-w-[190px] text-right font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            {buyState !== "COMPLETED" && (
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                disabled={isConfirmDisabled}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Revisar compra
              </button>
            )}

            {!user && !authLoading && (
              <p className="mt-3 text-center text-xs text-muted-foreground">Inicia sesión para acceder a funciones avanzadas de compra.</p>
            )}
          </EasyCryptoSummary>

          <div className="grid grid-cols-2 gap-3">
            <EasyCryptoMetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Precio"
              value={priceRef ? priceRef.converted.toLocaleString("es-MX", { maximumFractionDigits: 2 }) : "—"}
              detail={`${fiatCurrency} / ${cryptoCurrency}`}
            />
            <EasyCryptoMetricCard
              icon={<CreditCard className="h-4 w-4" />}
              label="Metodos"
              value={String(paymentMethods.length)}
              detail="Disponibles"
            />
          </div>

          <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-black text-foreground">Custodia segura</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tus activos quedan acreditados en tu wallet Deco Exchange después de confirmar la operación.
            </p>
          </div>
        </aside>
      </main>

      <EasyCryptoConfirmModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Revisar compra"
        subtitle="Confirma la cotizacion, metodo y condiciones antes de continuar."
        footer={
          buyState === "INTENT_READY" ? (
            <button
              type="button"
              onClick={handleConfirmIntent}
              disabled={isConfirming}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
              {isConfirming ? "Confirmando..." : "Confirmar pago"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateIntent}
              disabled={isConfirmDisabled || isCreatingIntent}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingIntent && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreatingIntent ? "Reservando cotizacion..." : "Crear intencion de compra"}
            </button>
          )
        }
      >
        <div className="space-y-3 text-sm">
          {[
            { label: "Pagas", value: `${parsedAmount || 0} ${fiatCurrency}` },
            { label: "Recibes", value: `${buyQuote?.toAmountAfterFees.toLocaleString(undefined, { maximumFractionDigits: 8 }) ?? 0} ${cryptoCurrency}` },
            { label: "Metodo", value: selectedMethod?.name ?? "Pendiente" },
            { label: "Tasa", value: buyQuote ? `1 ${fiatCurrency} = ${buyQuote.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${cryptoCurrency}` : "Pendiente" },
            { label: "Comision", value: buyQuote ? `${(buyQuote.fees?.total ?? 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${cryptoCurrency}` : "Variable" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-right font-semibold text-foreground">{item.value}</span>
            </div>
          ))}

          {intent && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Intencion creada</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>Referencia: <span className="font-mono text-foreground">{intent.reference}</span></p>
                <p>Estado: <span className="font-semibold text-amber-500">{intent.status}</span></p>
                <p>Expira: <span className="text-foreground">{new Date(intent.expiresAt).toLocaleTimeString()}</span></p>
              </div>
            </div>
          )}

          {buyError && (
            <div className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              {buyError}
            </div>
          )}
        </div>
      </EasyCryptoConfirmModal>
    </ActionPageShell>
  )
}
