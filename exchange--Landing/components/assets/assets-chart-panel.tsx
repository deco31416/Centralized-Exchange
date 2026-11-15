"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { AssetChartPoint, CatalogAsset } from "@/components/assets/assets-data"

const rateSeries: AssetChartPoint[] = [
  { label: "09:00", value: 3978 },
  { label: "10:00", value: 3972 },
  { label: "11:00", value: 3988 },
  { label: "12:00", value: 3984 },
  { label: "13:00", value: 3996 },
  { label: "14:00", value: 4001 },
  { label: "15:00", value: 3991 },
  { label: "16:00", value: 4008 },
  { label: "17:00", value: 4015 },
  { label: "18:00", value: 4009 },
  { label: "19:00", value: 4022 },
  { label: "20:00", value: 4018 },
  { label: "21:00", value: 4029 },
  { label: "22:00", value: 4024 },
]

const tokenSeries: AssetChartPoint[] = [
  { label: "D-13", value: 0.026 },
  { label: "D-12", value: 0.027 },
  { label: "D-11", value: 0.0265 },
  { label: "D-10", value: 0.028 },
  { label: "D-9", value: 0.0276 },
  { label: "D-8", value: 0.029 },
  { label: "D-7", value: 0.0294 },
  { label: "D-6", value: 0.0287 },
  { label: "D-5", value: 0.0302 },
  { label: "D-4", value: 0.0308 },
  { label: "D-3", value: 0.0304 },
  { label: "D-2", value: 0.0312 },
  { label: "D-1", value: 0.0316 },
  { label: "Hoy", value: 0.031416 },
]

function normalizeTradingViewSymbol(symbol: string): string {
  return symbol.replace(/:([A-Z]+)USDT\.P$/, ":$1USDTPERP")
}

function getAssetSeries(asset: CatalogAsset) {
  if (asset.chartSeries?.length) return asset.chartSeries
  return asset.chartType === "deco-token" ? tokenSeries : rateSeries
}

function formatChartValue(value: number, asset: CatalogAsset) {
  if (asset.chartType === "deco-token") return value.toFixed(6)
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 })
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return ""

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const previous = points[index - 1]
    const controlX = previous.x + (point.x - previous.x) / 2
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`
  }, "")
}

function getQuoteDetails(asset: CatalogAsset, series: AssetChartPoint[]) {
  const values = series.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const last = asset.rateQuote?.last ?? series[series.length - 1].value
  const bid = asset.rateQuote?.bid ?? last * 0.9992
  const ask = asset.rateQuote?.ask ?? last * 1.0008
  const spreadPct = asset.rateQuote?.spreadPct ?? ((ask - bid) / last) * 100

  return {
    ask,
    bid,
    high24h: asset.rateQuote?.high24h ?? max,
    last,
    low24h: asset.rateQuote?.low24h ?? min,
    source: asset.rateQuote?.source ?? (asset.chartType === "deco-token" ? "Deco interno" : "Deco Rate"),
    spreadPct,
    updatedAtLabel: asset.rateQuote?.updatedAtLabel ?? "Hace 2 min",
  }
}

function DecoReferenceChart({ asset }: { asset: CatalogAsset }) {
  const series = getAssetSeries(asset)
  const width = 860
  const height = 280
  const chartTop = 22
  const chartBottom = 230
  const left = 22
  const right = 96
  const plotWidth = width - left - right
  const values = series.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padding = range * 0.18
  const low = min - padding
  const high = max + padding
  const xStep = plotWidth / Math.max(series.length - 1, 1)
  const color = asset.chartType === "deco-token" ? asset.color : "#f97316"
  const y = (value: number) => chartBottom - ((value - low) / (high - low || 1)) * (chartBottom - chartTop)
  const coordinates = series.map((point, index) => ({ x: left + index * xStep, y: y(point.value) }))
  const linePath = buildSmoothPath(coordinates)
  const areaPath = `${linePath} L ${left + plotWidth} ${chartBottom} L ${left} ${chartBottom} Z`
  const lastPoint = series[series.length - 1]
  const previousPoint = series[Math.max(series.length - 2, 0)]
  const isUp = lastPoint.value >= previousPoint.value
  const yTicks = [high, low + (high - low) / 2, low]
  const quote = getQuoteDetails(asset, series)
  const gradientId = `assetSeriesFade-${asset.slug}`
  const chartTitle = asset.chartType === "deco-token" ? "Referencia del ecosistema" : "Tasa referencial"
  const chartSubtitle =
    asset.chartType === "deco-token"
      ? "Valor informativo sujeto a reglas del ecosistema."
      : "Tasa informativa; la cotizacion final se confirma al operar."
  const summaryItems =
    asset.chartType === "deco-token"
      ? [
          ["Referencia", formatChartValue(quote.last, asset)],
          ["Rango 24h", `${formatChartValue(quote.low24h, asset)} - ${formatChartValue(quote.high24h, asset)}`],
          ["Fuente", quote.source],
          ["Actualizado", quote.updatedAtLabel],
        ]
      : [
          ["Compra", formatChartValue(quote.bid, asset)],
          ["Venta", formatChartValue(quote.ask, asset)],
          ["Spread", `${quote.spreadPct.toFixed(2)}%`],
          ["Rango 24h", `${formatChartValue(quote.low24h, asset)} - ${formatChartValue(quote.high24h, asset)}`],
        ]

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{chartTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{chartSubtitle}</p>
        </div>
        <div className="rounded-full border border-border bg-card px-3 py-1 text-sm font-black text-foreground">
          <span className={cn(isUp ? "text-emerald-500" : "text-red-500")}>{asset.referenceChange}</span>
          <span className="text-muted-foreground"> · 24h</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={left + plotWidth} y1={y(tick)} y2={y(tick)} className="stroke-border opacity-70" strokeDasharray="4 12" />
            <text x={width - 18} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground text-[12px] font-bold">
              {formatChartValue(tick, asset)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <circle cx={coordinates[coordinates.length - 1].x} cy={coordinates[coordinates.length - 1].y} r="5" fill={color} />
        <circle cx={coordinates[coordinates.length - 1].x} cy={coordinates[coordinates.length - 1].y} r="10" fill={color} opacity="0.12" />
        <text x={left} y={height - 16} className="fill-muted-foreground text-[12px] font-bold">
          {series[0].label}
        </text>
        <text x={left + plotWidth} y={height - 16} textAnchor="end" className="fill-muted-foreground text-[12px] font-bold">
          {lastPoint.label}
        </text>
      </svg>

      <div className="grid grid-cols-2 border-t border-border text-xs md:grid-cols-4">
        {summaryItems.map(([label, value], index) => (
          <div key={label} className={cn("px-4 py-3", index > 0 && "border-l border-border")}>
            <p className="text-muted-foreground">{label}</p>
            <p className="mt-1 truncate font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TradingViewAssetChart({ asset }: { asset: CatalogAsset }) {
  const fallbackTimerRef = React.useRef<number | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [theme, setTheme] = React.useState<"dark" | "light">("dark")
  const reactId = React.useId()

  const chartSrc = React.useMemo(() => {
    const frameElementId = `asset_tv_${reactId.replace(/[^a-zA-Z0-9]/g, "")}`
    const symbol = normalizeTradingViewSymbol(asset.tradingViewSymbol ?? asset.referencePair.replace("/", ""))
    const params = new URLSearchParams({
      frameElementId,
      symbol,
      interval: "D",
      hidesidetoolbar: "0",
      symboledit: "1",
      saveimage: "0",
      toolbarbg: "000000",
      studies: "[]",
      theme,
      style: "1",
      timezone: "America/Bogota",
      withdateranges: "1",
      hide_side_toolbar: "0",
      allow_symbol_change: "1",
      calendar: "0",
      locale: "es",
    })

    return `https://s.tradingview.com/widgetembed/?${params.toString()}`
  }, [asset.referencePair, asset.tradingViewSymbol, reactId, theme])

  React.useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  React.useEffect(() => {
    setFailed(false)
    setLoaded(false)
    fallbackTimerRef.current = window.setTimeout(() => setFailed(true), 18_000)

    return () => {
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current)
    }
  }, [chartSrc])

  function handleLoad() {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    setLoaded(true)
    setFailed(false)
  }

  if (failed) {
    return (
      <div>
        <DecoReferenceChart asset={asset} />
        <p className="mt-2 text-xs text-muted-foreground">
          TradingView no respondio a tiempo. Mostrando Deco Chart temporal.
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-[440px] overflow-hidden rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background">
      <div className={cn("absolute inset-0 flex items-center justify-center text-sm font-bold text-muted-foreground", loaded && "hidden")}>
        Cargando TradingView...
      </div>
      <iframe
        key={chartSrc}
        src={chartSrc}
        title={`TradingView ${asset.symbol}`}
        className="relative z-10 h-full w-full border-0"
        allowFullScreen
        referrerPolicy="origin"
        onLoad={handleLoad}
      />
    </div>
  )
}

export function AssetChartPanel({ asset }: { asset: CatalogAsset }) {
  const isTradingView = asset.chartType === "tradingview" && Boolean(asset.tradingViewSymbol)
  const chartLabel =
    asset.chartType === "deco-rate"
      ? "Tasa Deco"
      : asset.chartType === "deco-token"
        ? "Deco Chart"
        : "TradingView"

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{chartLabel}</p>
          <h2 className="mt-1 text-2xl font-black text-foreground">{asset.referencePair}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Referencia pública. La operación final depende de disponibilidad, proveedor y usuario.
          </p>
        </div>
        <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
          {asset.referenceChange} · 24h
        </div>
      </div>

      {isTradingView ? (
        <TradingViewAssetChart asset={asset} />
      ) : (
        <DecoReferenceChart asset={asset} />
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[
          ["Fuente", chartLabel],
          ["Referencia", asset.referenceValue],
          ["Mercado", assetTypeLabel(asset.type)],
          ["Estado", isTradingView ? "Publico" : "Propio"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-3 py-2">
            <p className="text-muted-foreground">{label}</p>
            <p className="truncate font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function assetTypeLabel(type: CatalogAsset["type"]) {
  if (type === "deco-token") return "Token Deco"
  if (type === "stablecoin") return "Stablecoin"
  if (type === "fiat") return "Fiat"
  return "Cripto"
}
