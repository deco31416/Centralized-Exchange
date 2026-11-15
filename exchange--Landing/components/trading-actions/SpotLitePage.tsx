"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BarChart2, ChevronDown, Gauge, ReceiptText, ShieldCheck, TrendingDown, TrendingUp, Zap } from "lucide-react"

import { useAuth } from "@/components/p2p/use-auth"
import {
  EasyCryptoConfirmModal,
  EasyCryptoHero,
  EasyCryptoMetricCard,
  EasyCryptoPanel,
  EasyCryptoSummary,
} from "@/components/easy-crypto/easy-crypto-components"
import { useAllAssets, useQuote } from "@/hooks/use-quote"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { ActionStatusCard } from "@/components/trading-actions/ActionStatusCard"
import { AssetAmountInput } from "@/components/trading-actions/AssetAmountInput"
import { QuotePreviewCard } from "@/components/trading-actions/QuotePreviewCard"

type Side = "buy" | "sell"
type TradingViewInterval = "15" | "60" | "240" | "D"
type SelectOption = { code: string; label?: string; name?: string }

const quickPairs = ["BTC", "ETH", "SOL", "BNB"]
const intervals: Array<{ label: string; value: TradingViewInterval }> = [
  { label: "15M", value: "15" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
]

function resolveTradingViewSymbol(baseAsset: string, quoteAsset: string) {
  const base = baseAsset.toUpperCase()
  if (base === "USDT") return "COINBASE:USDTUSD"
  if (base === "USDC") return "COINBASE:USDCUSD"
  return `BINANCE:${base}USDT`
}

function formatTradingViewPair(symbol: string) {
  const raw = symbol.includes(":") ? symbol.split(":")[1] ?? symbol : symbol
  if (raw.endsWith("USDT")) return `${raw.slice(0, -4)}/USDT`
  if (raw.endsWith("USD")) return `${raw.slice(0, -3)}/USD`
  return raw
}

function SpotAssetSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: SelectOption[]
  value: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const selected = options.find((option) => option.code === value)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative flex-1">
      <label className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-4 text-left text-sm font-black text-foreground transition hover:bg-card/70"
      >
        <span>{selected?.code ?? value}</span>
        <ChevronDown className="h-4 w-4 text-primary" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover p-1 shadow-2xl">
          <div className="max-h-72 overflow-y-auto dropdown-scroll">
            {options.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  onChange(option.code)
                  setOpen(false)
                }}
                className={[
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition hover:bg-accent",
                  option.code === value ? "bg-primary/[0.06]" : "",
                ].join(" ")}
              >
                <span>
                  <span className="block font-black text-foreground">{option.code}</span>
                  {option.name && option.name !== option.code ? (
                    <span className="text-xs text-muted-foreground">{option.name}</span>
                  ) : null}
                </span>
                {option.code === value ? <span className="text-xs font-black text-primary">Activo</span> : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TradingViewLiteChart({ baseAsset, interval, onIntervalChange, quoteAsset }: {
  baseAsset: string
  interval: TradingViewInterval
  onIntervalChange: (interval: TradingViewInterval) => void
  quoteAsset: string
}) {
  const symbol = resolveTradingViewSymbol(baseAsset, quoteAsset)
  const displayPair = formatTradingViewPair(symbol)

  const chartSrc = useMemo(() => {
    const config = {
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    }

    return `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(config))}`
  }, [interval, symbol])

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Referencia TradingView</p>
          <div className="mt-1 flex flex-wrap items-end gap-2">
            <h2 className="text-2xl font-black text-foreground">{displayPair}</h2>
            <span className="pb-1 text-xs font-bold text-muted-foreground">{symbol}</span>
          </div>
        </div>
        <div className="flex rounded-full border border-border bg-background p-1 text-xs font-black">
          {intervals.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onIntervalChange(item.value)}
              className={[
                "rounded-full px-3 py-1 transition",
                interval === item.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border bg-black">
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
          Cargando TradingView...
        </div>
        <iframe
          key={chartSrc}
          src={chartSrc}
          title={`TradingView ${symbol}`}
          className="relative z-10 h-full w-full border-0"
          allowFullScreen
          referrerPolicy="origin"
        />
      </div>
    </div>
  )
}

export default function SpotLitePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { cryptoAssets, fiatAssets, loading: assetsLoading } = useAllAssets()

  const [side, setSide] = useState<Side>("buy")
  const [amount, setAmount] = useState("")
  const [baseAsset, setBaseAsset] = useState("BTC")
  const [quoteAsset, setQuoteAsset] = useState("MXN")
  const [chartInterval, setChartInterval] = useState<TradingViewInterval>("60")
  const [reviewOpen, setReviewOpen] = useState(false)

  const parsedAmount = parseFloat(amount) || 0
  const fromAsset = side === "buy" ? quoteAsset : baseAsset
  const toAsset = side === "buy" ? baseAsset : quoteAsset
  const { data: quote, loading: quoteLoading, error: quoteError, refresh } = useQuote(fromAsset, toAsset, parsedAmount)

  const canShowQuote = parsedAmount > 0
  const canReview = Boolean(user && quote && parsedAmount > 0)
  const fiatOptions = assetsLoading ? [{ code: quoteAsset, label: quoteAsset }] : fiatAssets
  const cryptoOptions = assetsLoading ? [{ code: baseAsset, label: baseAsset }] : cryptoAssets
  const visibleQuickPairs = quickPairs.filter((pair) => cryptoOptions.some((asset) => asset.code === pair))

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section className="space-y-8">
          <EasyCryptoHero
            title="Opera en vivo"
            description="Sigue la tendencia de un par y prepara una compra o venta simple sin entrar al mercado avanzado."
          />

          <EasyCryptoPanel>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Referencia de mercado</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">TradingView en vivo</h2>
                <p className="mt-1 text-sm text-muted-foreground">La grafica es referencia publica; tu operacion usa la moneda seleccionada.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleQuickPairs.map((pair) => (
                  <button
                    key={pair}
                    type="button"
                    onClick={() => setBaseAsset(pair)}
                    className={[
                      "rounded-full border border-border px-3 py-1.5 text-xs font-black transition",
                      baseAsset === pair ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
            <TradingViewLiteChart
              baseAsset={baseAsset}
              interval={chartInterval}
              onIntervalChange={setChartInterval}
              quoteAsset={quoteAsset}
            />
          </EasyCryptoPanel>

          <div className="space-y-5">
            <EasyCryptoPanel>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <SpotAssetSelect label="Activo base" value={baseAsset} onChange={setBaseAsset} options={cryptoOptions} />
                <span className="pb-3 text-center text-xl font-black text-muted-foreground">/</span>
                <SpotAssetSelect label="Cotizacion" value={quoteAsset} onChange={setQuoteAsset} options={fiatOptions} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setSide("buy")}
                  className={[
                    "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition",
                    side === "buy" ? "bg-emerald-500/15 text-emerald-500" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <TrendingUp className="h-4 w-4" />
                  Comprar
                </button>
                <button
                  type="button"
                  onClick={() => setSide("sell")}
                  className={[
                    "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition",
                    side === "sell" ? "bg-red-500/15 text-red-500" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <TrendingDown className="h-4 w-4" />
                  Vender
                </button>
              </div>
            </EasyCryptoPanel>

            <div className="space-y-5">
              <EasyCryptoPanel>
                <AssetAmountInput
                  label={side === "buy" ? `Pagas (${quoteAsset})` : `Vendes (${baseAsset})`}
                  amount={amount}
                  onAmountChange={setAmount}
                  selectedAsset={fromAsset}
                  onAssetChange={() => {}}
                  assets={[{ code: fromAsset, label: fromAsset }]}
                  placeholder="0.00"
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
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <EasyCryptoSummary title="Resumen spot" icon={<ReceiptText className="h-4 w-4 text-primary" />}>
            <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{side === "buy" ? "Comprar" : "Vender"}</p>
              <p className="mt-2 text-3xl font-black text-foreground">{baseAsset}</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Operacion", value: `${baseAsset}/${quoteAsset}` },
                { label: "Grafica", value: formatTradingViewPair(resolveTradingViewSymbol(baseAsset, quoteAsset)) },
                { label: "Accion", value: side === "buy" ? "Compra" : "Venta" },
                { label: "Monto", value: `${parsedAmount || 0} ${fromAsset}` },
                { label: "Resultado", value: quote ? `${quote.converted.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${toAsset}` : "Pendiente" },
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
              Revisar orden
            </button>

            {!user && !authLoading && <p className="mt-3 text-center text-xs text-muted-foreground">Inicia sesion para operar.</p>}
          </EasyCryptoSummary>

          <div className="grid grid-cols-2 gap-3">
            <EasyCryptoMetricCard icon={<BarChart2 className="h-4 w-4" />} label="Mercado" value="Lite" detail="Simple" />
            <EasyCryptoMetricCard icon={<Gauge className="h-4 w-4" />} label="Fee" value="~0.2%" detail="Estimado" />
          </div>

          <EasyCryptoPanel>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-black text-foreground">Riesgo visible</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Spot Lite muestra precio referencial. Para libro de ordenes completo se usara Mercado Spot.
            </p>
          </EasyCryptoPanel>

          <ActionStatusCard
            title="Ejecucion spot pendiente"
            description="La cotizacion existe. La orden final requiere motor spot o endpoint dedicado."
            debtCode="SPOTLITE-EXECUTION-001"
          />
        </aside>
      </main>

      <EasyCryptoConfirmModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Revisar orden spot"
        subtitle="Mockup operativo para conectar con el motor spot."
        footer={
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center rounded-full bg-primary/40 px-4 py-3 text-sm font-bold text-primary-foreground opacity-70"
          >
            Ejecucion final pendiente
          </button>
        }
      >
        <div className="space-y-3 text-sm">
          {[
            { label: "Par", value: `${baseAsset}/${quoteAsset}` },
            { label: "Accion", value: side === "buy" ? "Compra" : "Venta" },
            { label: "Pagas", value: `${parsedAmount} ${fromAsset}` },
            { label: "Recibes", value: `${quote?.converted.toLocaleString(undefined, { maximumFractionDigits: 8 }) ?? 0} ${toAsset}` },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-right font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </EasyCryptoConfirmModal>
    </ActionPageShell>
  )
}
