"use client"

import { useState } from "react"
import { AlertTriangle, Clock, ReceiptText, ShieldCheck, TrendingDown, TrendingUp, Wallet } from "lucide-react"

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

export default function SellCryptoPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { cryptoAssets, fiatAssets, loading: assetsLoading } = useAllAssets()

  const [cryptoAmount, setCryptoAmount] = useState("")
  const [cryptoCurrency, setCryptoCurrency] = useState("BTC")
  const [fiatCurrency, setFiatCurrency] = useState("MXN")
  const [reviewOpen, setReviewOpen] = useState(false)

  const parsedAmount = parseFloat(cryptoAmount) || 0
  const { data: quote, loading: quoteLoading, error: quoteError, refresh } = useQuote(
    cryptoCurrency,
    fiatCurrency,
    parsedAmount,
  )
  const { data: priceRef } = useQuote(cryptoCurrency, fiatCurrency, 1)

  const canShowQuote = parsedAmount > 0
  const canReview = Boolean(user && quote && parsedAmount > 0)

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section className="space-y-6">
          <EasyCryptoHero
            title="Vende cripto"
            description="Convierte tus activos a moneda local con tasa visible, comision estimada y recepcion antes de confirmar."
            aside={<EasyCryptoHeroStat label="Salida local" value="T+0" description="Recepcion estimada segun moneda, pais y metodo disponible." />}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-5">
              <EasyCryptoPanel>
                <AssetAmountInput
                  label="Vendes"
                  amount={cryptoAmount}
                  onAmountChange={setCryptoAmount}
                  selectedAsset={cryptoCurrency}
                  onAssetChange={setCryptoCurrency}
                  assets={assetsLoading ? [{ code: cryptoCurrency, label: cryptoCurrency }] : cryptoAssets}
                  placeholder="0.00000000"
                />

                <div className="my-4 flex justify-center">
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-black text-muted-foreground">→</span>
                </div>

                <AssetAmountInput
                  label="Recibes estimado"
                  amount={canShowQuote && quote ? quote.converted.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ""}
                  onAmountChange={() => {}}
                  selectedAsset={fiatCurrency}
                  onAssetChange={setFiatCurrency}
                  assets={assetsLoading ? [{ code: fiatCurrency, label: fiatCurrency }] : fiatAssets}
                  disabled
                  placeholder="-"
                />
              </EasyCryptoPanel>

              {canShowQuote && (
                <QuotePreviewCard
                  from={cryptoCurrency}
                  to={fiatCurrency}
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
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Metodo de recepcion</p>
                <div className="mt-4 grid gap-2">
                  {[
                    ["Bolsillito", "Saldo local disponible"],
                    ["Banco local", "Transferencia regulada"],
                    ["Wallet aliada", "Segun pais"],
                  ].map(([title, detail]) => (
                    <button
                      key={title}
                      type="button"
                      className="flex min-h-[72px] items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition hover:bg-card/70"
                    >
                      <span>
                        <span className="block text-sm font-black text-foreground">{title}</span>
                        <span className="text-xs text-muted-foreground">{detail}</span>
                      </span>
                      <span className="text-xs font-bold text-primary">{fiatCurrency}</span>
                    </button>
                  ))}
                </div>
              </EasyCryptoPanel>

              <ActionStatusCard
                title="Ejecucion de venta pendiente"
                description="La cotizacion ya existe. La venta final se conectara al endpoint de liquidacion del backend."
                debtCode="SELL-EXECUTION-001"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <EasyCryptoSummary title="Resumen de venta" icon={<ReceiptText className="h-4 w-4 text-primary" />}>
            <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recibiras</p>
              <p className="mt-2 text-3xl font-black text-foreground">
                {quote ? quote.converted.toLocaleString("es-MX", { maximumFractionDigits: 2 }) : "0"} {fiatCurrency}
              </p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Vendes", value: `${parsedAmount || 0} ${cryptoCurrency}` },
                { label: "Recepcion", value: "Bolsillito" },
                { label: "Tasa", value: quote ? `1 ${cryptoCurrency} = ${quote.rate.toLocaleString("es-MX", { maximumFractionDigits: 2 })} ${fiatCurrency}` : "Pendiente" },
                { label: "Tiempo", value: "T+0 estimado" },
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
              Revisar venta
            </button>

            {!user && !authLoading && (
              <p className="mt-3 text-center text-xs text-muted-foreground">Inicia sesion para preparar una venta.</p>
            )}
          </EasyCryptoSummary>

          <div className="grid grid-cols-2 gap-3">
            <EasyCryptoMetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Precio"
              value={priceRef ? priceRef.converted.toLocaleString("es-MX", { maximumFractionDigits: 2 }) : "-"}
              detail={`${fiatCurrency} / ${cryptoCurrency}`}
            />
            <EasyCryptoMetricCard icon={<Clock className="h-4 w-4" />} label="Tiempo" value="T+0" detail="Estimado" />
          </div>

          <EasyCryptoPanel>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-black text-foreground">Salida protegida</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              La venta se revisa con tasa, comision y destino antes de liquidar el saldo local.
            </p>
          </EasyCryptoPanel>
        </aside>
      </main>

      <EasyCryptoConfirmModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Revisar venta"
        subtitle="Mockup operativo listo para conectar al gateway de liquidacion."
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
            { label: "Vendes", value: `${parsedAmount} ${cryptoCurrency}` },
            { label: "Recibes", value: `${quote?.converted.toLocaleString("es-MX", { maximumFractionDigits: 2 }) ?? 0} ${fiatCurrency}` },
            { label: "Metodo", value: "Bolsillito" },
            { label: "Estado", value: "Endpoint pendiente" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-right font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
          <div className="flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            La tasa puede cambiar al ejecutar la venta real.
          </div>
        </div>
      </EasyCryptoConfirmModal>
    </ActionPageShell>
  )
}
