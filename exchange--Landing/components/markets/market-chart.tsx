"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MarketCard } from "./market-card"
import type { MarketChartProvider } from "@/types/markets"

type MarketChartPair = {
  pair: string
  price: string
  change: string
  volume: string
  provider: MarketChartProvider
  market: string
  tradingViewSymbol?: string
}

const tradingViewCandles = [42, 58, 51, 68, 74, 62, 79, 84, 73, 88, 92, 86, 96, 90, 102, 98]
const decoCandles = [35, 42, 48, 45, 56, 62, 59, 67, 74, 70, 82, 78, 88, 92, 89, 96]

const candleSeries = [
  { open: 62, high: 78, low: 55, close: 72, volume: 44 },
  { open: 72, high: 80, low: 63, close: 66, volume: 39 },
  { open: 66, high: 84, low: 61, close: 79, volume: 58 },
  { open: 79, high: 88, low: 70, close: 74, volume: 47 },
  { open: 74, high: 92, low: 69, close: 86, volume: 64 },
  { open: 86, high: 96, low: 80, close: 91, volume: 72 },
  { open: 91, high: 98, low: 83, close: 88, volume: 55 },
  { open: 88, high: 104, low: 84, close: 99, volume: 78 },
  { open: 99, high: 110, low: 94, close: 106, volume: 82 },
  { open: 106, high: 113, low: 97, close: 101, volume: 69 },
  { open: 101, high: 119, low: 98, close: 115, volume: 88 },
  { open: 115, high: 124, low: 108, close: 121, volume: 93 },
]

function normalizeTradingViewSymbol(symbol: string): string {
  return symbol.replace(/:([A-Z]+)USDT\.P$/, ":$1USDTPERP")
}

function NativeCandles({ internal }: { internal: boolean }) {
  const chartHeight = 170
  const volumeHeight = 44
  const totalWidth = 720
  const gap = totalWidth / candleSeries.length
  const values = candleSeries.flatMap((item) => [item.high, item.low])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const scaleY = (value: number) => chartHeight - ((value - min) / (max - min)) * chartHeight

  return (
    <svg viewBox={`0 0 ${totalWidth} ${chartHeight + volumeHeight + 18}`} className="h-[240px] w-full overflow-visible">
      <defs>
        <linearGradient id="spotChartFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => (
        <line
          key={line}
          x1="0"
          x2={totalWidth}
          y1={(chartHeight / 4) * line}
          y2={(chartHeight / 4) * line}
          className="stroke-border"
          strokeDasharray="5 8"
        />
      ))}
      {candleSeries.map((item, index) => {
        const x = index * gap + gap / 2
        const openY = scaleY(item.open)
        const closeY = scaleY(item.close)
        const highY = scaleY(item.high)
        const lowY = scaleY(item.low)
        const positive = item.close >= item.open
        const bodyY = Math.min(openY, closeY)
        const bodyHeight = Math.max(Math.abs(openY - closeY), 5)

        return (
          <g key={`${item.open}-${index}`}>
            <line
              x1={x}
              x2={x}
              y1={highY}
              y2={lowY}
              className={positive ? "stroke-emerald-500" : "stroke-red-500"}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x={x - 10}
              y={bodyY}
              width="20"
              height={bodyHeight}
              rx="3"
              className={cn(positive ? "fill-emerald-500" : "fill-red-500", internal && "fill-primary")}
            />
            <rect
              x={x - 13}
              y={chartHeight + 18 + (volumeHeight - item.volume / 2)}
              width="26"
              height={item.volume / 2}
              rx="3"
              className={cn("fill-muted-foreground/25", internal && "fill-primary/35")}
            />
          </g>
        )
      })}
    </svg>
  )
}

function TradingViewChart({ symbol, compact }: { symbol: string; compact: boolean }) {
  const fallbackTimerRef = React.useRef<number | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [theme, setTheme] = React.useState<"dark" | "light">("dark")
  const reactId = React.useId()

  const chartSrc = React.useMemo(() => {
    const frameElementId = `tradingview_${reactId.replace(/[^a-zA-Z0-9]/g, "")}`
    const normalizedSymbol = normalizeTradingViewSymbol(symbol)
    const params = new URLSearchParams({
      frameElementId,
      symbol: normalizedSymbol,
      interval: "D",
      hidesidetoolbar: compact ? "1" : "0",
      symboledit: "1",
      saveimage: "0",
      toolbarbg: "000000",
      studies: "[]",
      theme,
      style: "1",
      timezone: "America/Bogota",
      withdateranges: compact ? "0" : "1",
      hide_side_toolbar: compact ? "1" : "0",
      allow_symbol_change: "1",
      calendar: "0",
      locale: "es",
    })

    return `https://s.tradingview.com/widgetembed/?${params.toString()}`
  }, [symbol, compact, reactId, theme])

  React.useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  React.useEffect(() => {
    setFailed(false)
    setLoaded(false)

    fallbackTimerRef.current = window.setTimeout(() => setFailed(true), 18_000)

    return () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current)
      }
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
      <div className="rounded-[var(--radius)] border border-border bg-background px-3 py-4">
        <NativeCandles internal={false} />
        <p className="mt-2 text-xs text-muted-foreground">
          TradingView no respondio a tiempo. Mostrando Deco Chart temporal.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[var(--radius)] border border-border bg-background", compact ? "h-[280px]" : "h-[440px]")}>
      <div className={cn("absolute inset-0 flex items-center justify-center text-sm font-bold text-muted-foreground", loaded && "hidden")}>
        Cargando TradingView...
      </div>
      <iframe
        key={chartSrc}
        src={chartSrc}
        title={`TradingView ${symbol}`}
        className="relative z-10 h-full w-full border-0"
        allowFullScreen
        referrerPolicy="origin"
        onLoad={handleLoad}
      />
    </div>
  )
}

export function MarketChart({ pair, compact = false }: { pair: MarketChartPair; compact?: boolean }) {
  const usesTradingView = pair.provider === "TradingView" && Boolean(pair.tradingViewSymbol)
  const tradingViewSymbol = pair.tradingViewSymbol ? normalizeTradingViewSymbol(pair.tradingViewSymbol) : undefined
  const fallbackBars = usesTradingView ? tradingViewCandles : decoCandles

  return (
    <MarketCard className={cn("overflow-hidden", compact ? "min-h-[260px]" : "min-h-[440px]")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{pair.pair}</p>
          <h2 className="mt-1 text-2xl font-black text-foreground">{pair.price}</h2>
          <p className={cn("text-sm", pair.change.startsWith("+") ? "text-emerald-500" : "text-red-500")}>
            {pair.change} · 24h
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
            {usesTradingView ? "TradingView" : "Deco Chart"}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
            {pair.market}
          </span>
          <div className="flex rounded-full border border-border bg-background p-1 text-xs font-bold">
            {["1H", "4H", "1D", "1W"].map((item) => (
              <span key={item} className={cn("rounded-full px-3 py-1 text-muted-foreground", item === "1D" && "bg-foreground text-background")}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {usesTradingView && tradingViewSymbol ? (
          <TradingViewChart symbol={tradingViewSymbol} compact={compact} />
        ) : (
          <div className="rounded-[var(--radius)] border border-border bg-background px-3 py-4">
            <NativeCandles internal={!usesTradingView} />
            <div className="sr-only">
              {fallbackBars.map((height) => `${height} `)}
            </div>
          </div>
        )}
        <div className="mt-2 text-xs text-muted-foreground">
          {usesTradingView
            ? "Grafica TradingView para mercado publico."
            : "Grafica Deco para token propio o mercado interno."}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[
          ["Fuente", usesTradingView ? tradingViewSymbol ?? "TradingView" : "Datos internos"],
          ["Volumen", pair.volume],
          ["Mercado", pair.market],
          ["Estado", usesTradingView ? "Público" : "Propio"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-background px-3 py-2">
            <p className="text-muted-foreground">{label}</p>
            <p className="truncate font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </MarketCard>
  )
}
