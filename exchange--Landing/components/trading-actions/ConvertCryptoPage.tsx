"use client"

import { useState } from "react"
import { AlertTriangle, ArrowLeftRight, Gauge, ReceiptText, Repeat2, ShieldCheck } from "lucide-react"

import { useAuth } from "@/components/p2p/use-auth"
import {
  EasyCryptoConfirmModal,
  EasyCryptoHero,
  EasyCryptoHeroStat,
  EasyCryptoMetricCard,
  EasyCryptoPanel,
  EasyCryptoSummary,
} from "@/components/easy-crypto/easy-crypto-components"
import { useAllAssets, useQuote } from "@/hooks/use-quote"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { ActionStatusCard } from "@/components/trading-actions/ActionStatusCard"
import { AssetAmountInput } from "@/components/trading-actions/AssetAmountInput"
import { QuotePreviewCard } from "@/components/trading-actions/QuotePreviewCard"

export default function ConvertCryptoPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { assets, loading: assetsLoading } = useAllAssets()

  const [fromAmount, setFromAmount] = useState("")
  const [fromAsset, setFromAsset] = useState("MXN")
  const [toAsset, setToAsset] = useState("BTC")
  const [reviewOpen, setReviewOpen] = useState(false)

  const parsedAmount = parseFloat(fromAmount) || 0
  const { data: quote, loading: quoteLoading, error: quoteError, refresh } = useQuote(
    fromAsset,
    toAsset,
    parsedAmount,
  )

  const canShowQuote = parsedAmount > 0
  const canReview = Boolean(user && quote && parsedAmount > 0 && fromAsset !== toAsset)
  const allOptions = assetsLoading ? [{ code: fromAsset, label: fromAsset }, { code: toAsset, label: toAsset }] : assets

  function handleSwap() {
    setFromAsset(toAsset)
    setToAsset(fromAsset)
    setFromAmount("")
  }

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section className="space-y-6">
          <EasyCryptoHero
            title="Convertidor"
            description="Cambia entre saldos disponibles con una cotizacion simple, tasa visible y confirmacion antes de ejecutar."
            aside={<EasyCryptoHeroStat label="Swap simple" value="24/7" description="Conversion referencial entre activos disponibles en Deco Exchange." />}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-5">
              <EasyCryptoPanel>
                <AssetAmountInput
                  label="Entregas"
                  amount={fromAmount}
                  onAmountChange={setFromAmount}
                  selectedAsset={fromAsset}
                  onAssetChange={setFromAsset}
                  assets={allOptions}
                  placeholder="0.00"
                />

                <div className="my-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-card hover:text-foreground"
                    aria-label="Invertir conversion"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>

                <AssetAmountInput
                  label="Recibes estimado"
                  amount={canShowQuote && quote ? quote.converted.toLocaleString(undefined, { maximumFractionDigits: 8 }) : ""}
                  onAmountChange={() => {}}
                  selectedAsset={toAsset}
                  onAssetChange={setToAsset}
                  assets={allOptions}
                  disabled
                  placeholder="-"
                />
              </EasyCryptoPanel>

              {canShowQuote && (
                <QuotePreviewCard
                  from={fromAsset}
                  to={toAsset}
                  amount={parsedAmount}
                  result={quote?.converted ?? 0}
                  rate={quote?.rate ?? 0}
                  timestamp={quote?.timestamp}
                  loading={quoteLoading}
                  error={quoteError}
                  onRefresh={refresh}
                />
              )}
            </div>

            <div className="space-y-5">
              <EasyCryptoPanel>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pares rapidos</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    ["USDT", "COP"],
                    ["BTC", "USDT"],
                    ["ETH", "USDT"],
                    ["MXN", "USDT"],
                    ["COP", "BTC"],
                    ["USDC", "USD"],
                  ].map(([from, to]) => (
                    <button
                      key={`${from}-${to}`}
                      type="button"
                      onClick={() => {
                        setFromAsset(from)
                        setToAsset(to)
                        setFromAmount("")
                      }}
                      className="rounded-xl border border-border bg-background px-3 py-3 text-left text-sm font-black text-foreground transition hover:bg-card/70"
                    >
                      {from} <span className="text-muted-foreground">→</span> {to}
                    </button>
                  ))}
                </div>
              </EasyCryptoPanel>

              <ActionStatusCard
                title="Ejecucion de conversion pendiente"
                description="La cotizacion es real y bidireccional. El swap final se conectara al endpoint de conversion."
                debtCode="CONVERT-EXECUTION-001"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <EasyCryptoSummary title="Resumen de conversion" icon={<ReceiptText className="h-4 w-4 text-primary" />}>
            <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recibiras</p>
              <p className="mt-2 text-3xl font-black text-foreground">
                {quote ? quote.converted.toLocaleString(undefined, { maximumFractionDigits: 8 }) : "0"} {toAsset}
              </p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Entregas", value: `${parsedAmount || 0} ${fromAsset}` },
                { label: "Destino", value: toAsset },
                { label: "Tasa", value: quote ? `1 ${fromAsset} = ${quote.rate.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${toAsset}` : "Pendiente" },
                { label: "Spread", value: "Variable" },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="max-w-[190px] text-right font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              disabled={!canReview}
              className="mt-5 flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revisar conversion
            </button>

            {!user && !authLoading && (
              <p className="mt-3 text-center text-xs text-muted-foreground">Inicia sesion para preparar una conversion.</p>
            )}
          </EasyCryptoSummary>

          <div className="grid grid-cols-2 gap-3">
            <EasyCryptoMetricCard icon={<Repeat2 className="h-4 w-4" />} label="Ruta" value={`${fromAsset}/${toAsset}`} detail="Seleccionada" />
            <EasyCryptoMetricCard icon={<Gauge className="h-4 w-4" />} label="Fee" value="~0.3%" detail="Estimado" />
          </div>

          <EasyCryptoPanel>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-black text-foreground">Conversion protegida</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              La tasa final se confirma antes de ejecutar para evitar conversiones con datos vencidos.
            </p>
          </EasyCryptoPanel>
        </aside>
      </main>

      <EasyCryptoConfirmModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Revisar conversion"
        subtitle="Mockup operativo listo para conectar al motor de swap."
        footer={
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center rounded-full bg-primary/40 px-4 py-3 text-sm font-bold text-primary-foreground opacity-70"
          >
            Confirmacion final pendiente
          </button>
        }
      >
        <div className="space-y-3 text-sm">
          {[
            { label: "Entregas", value: `${parsedAmount} ${fromAsset}` },
            { label: "Recibes", value: `${quote?.converted.toLocaleString(undefined, { maximumFractionDigits: 8 }) ?? 0} ${toAsset}` },
            { label: "Tasa", value: quote ? `1 ${fromAsset} = ${quote.rate.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${toAsset}` : "Pendiente" },
            { label: "Estado", value: "Endpoint pendiente" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-right font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
          <div className="flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            Si la cotizacion vence, el usuario debe refrescar la tasa antes de confirmar.
          </div>
        </div>
      </EasyCryptoConfirmModal>
    </ActionPageShell>
  )
}
