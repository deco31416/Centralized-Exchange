"use client"

import * as React from "react"
import { ArrowRightLeft } from "lucide-react"

import { cn } from "@/lib/utils"

type CalculatorAsset = {
  code: string
  name: string
  type: "Fiat" | "Cripto" | "Stablecoin"
  usdValue: number
}

type ChartPoint = {
  label: string
  value: number
}

const calculatorAssets: CalculatorAsset[] = [
  { code: "USD", name: "Dolar estadounidense", type: "Fiat", usdValue: 1 },
  { code: "COP", name: "Peso colombiano", type: "Fiat", usdValue: 1 / 4000 },
  { code: "MXN", name: "Peso mexicano", type: "Fiat", usdValue: 1 / 18.5 },
  { code: "PEN", name: "Sol peruano", type: "Fiat", usdValue: 1 / 3.75 },
  { code: "USDT", name: "Tether USD", type: "Stablecoin", usdValue: 1 },
  { code: "BTC", name: "Bitcoin", type: "Cripto", usdValue: 67420.5 },
  { code: "ETH", name: "Ethereum", type: "Cripto", usdValue: 3520.2 },
  { code: "SOL", name: "Solana", type: "Cripto", usdValue: 150 },
]

function formatNumber(value: number, code?: string) {
  const maximumFractionDigits = value >= 1000 ? 2 : value >= 1 ? 4 : 8

  return value.toLocaleString("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: code && ["COP", "MXN", "PEN"].includes(code) ? 2 : 0,
  })
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

function hashPair(pair: string) {
  return pair.split("").reduce((total, character) => total + character.charCodeAt(0), 0)
}

function buildSeries(pair: string, rate: number): ChartPoint[] {
  const seed = hashPair(pair)
  const labels = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]

  return labels.map((label, index) => {
    const trend = (index - 5.5) * 0.0018
    const wave = Math.sin((index + (seed % 9)) * 0.72) * 0.006
    const pulse = Math.cos((index * 1.34 + seed) * 0.42) * 0.0038

    return {
      label,
      value: rate * (1 + trend + wave + pulse),
    }
  })
}

function CalculatorAssetPicker({
  assets,
  label,
  onChange,
  value,
}: {
  assets: CalculatorAsset[]
  label: string
  onChange: (code: string) => void
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {assets.map((asset) => {
          const active = asset.code === value

          return (
            <button
              key={asset.code}
              type="button"
              onClick={() => onChange(asset.code)}
              className={cn(
                "rounded-[calc(var(--radius)-0.6rem)] border px-3 py-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/55"
              )}
            >
              <span className="block text-sm font-black">{asset.code}</span>
              <span className={cn("mt-1 block truncate text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>
                {asset.type}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CalculatorReferenceChart({
  amount,
  estimated,
  from,
  rate,
  to,
}: {
  amount: number
  estimated: number
  from: CalculatorAsset
  rate: number
  to: CalculatorAsset
}) {
  const pair = `${from.code}/${to.code}`
  const series = React.useMemo(() => buildSeries(pair, rate), [pair, rate])
  const width = 860
  const height = 310
  const chartTop = 28
  const chartBottom = 248
  const left = 24
  const right = 106
  const plotWidth = width - left - right
  const values = series.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padding = range * 0.2
  const low = min - padding
  const high = max + padding
  const xStep = plotWidth / Math.max(series.length - 1, 1)
  const y = (value: number) => chartBottom - ((value - low) / (high - low || 1)) * (chartBottom - chartTop)
  const coordinates = series.map((point, index) => ({ x: left + index * xStep, y: y(point.value) }))
  const linePath = buildSmoothPath(coordinates)
  const areaPath = `${linePath} L ${left + plotWidth} ${chartBottom} L ${left} ${chartBottom} Z`
  const lastPoint = series[series.length - 1]
  const previousPoint = series[Math.max(series.length - 2, 0)]
  const change = ((lastPoint.value - previousPoint.value) / previousPoint.value) * 100
  const isUp = change >= 0
  const yTicks = [high, low + (high - low) / 2, low]
  const bid = rate * 0.9992
  const ask = rate * 1.0008
  const spread = ((ask - bid) / rate) * 100

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Tasa referencial</p>
          <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
            <h3 className="text-3xl font-black text-foreground">{pair}</h3>
            <p className="pb-1 text-sm font-bold text-muted-foreground">
              {formatNumber(amount, from.code)} {from.code} = {formatNumber(estimated, to.code)} {to.code}
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Serie lista para API: fecha, tasa, origen, destino y volumen.</p>
        </div>
        <div className="rounded-full border border-border bg-card px-3 py-1 text-sm font-black text-foreground">
          <span className={isUp ? "text-emerald-500" : "text-red-500"}>{isUp ? "+" : ""}{change.toFixed(2)}%</span>
          <span className="text-muted-foreground"> · 24h</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[310px] w-full">
        <defs>
          <linearGradient id="calculatorSeriesFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff6c02" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ff6c02" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={left + plotWidth}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-border opacity-70"
              strokeDasharray="4 12"
            />
            <text x={width - 18} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground text-[12px] font-bold">
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill="url(#calculatorSeriesFade)" />
        <path d={linePath} fill="none" stroke="#ff6c02" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <circle cx={coordinates[coordinates.length - 1].x} cy={coordinates[coordinates.length - 1].y} r="5" fill="#ff6c02" />
        <circle cx={coordinates[coordinates.length - 1].x} cy={coordinates[coordinates.length - 1].y} r="11" fill="#ff6c02" opacity="0.14" />
        <text x={left} y={height - 18} className="fill-muted-foreground text-[12px] font-bold">
          {series[0].label}
        </text>
        <text x={left + plotWidth} y={height - 18} textAnchor="end" className="fill-muted-foreground text-[12px] font-bold">
          {lastPoint.label}
        </text>
      </svg>

      <div className="grid grid-cols-2 border-t border-border text-xs md:grid-cols-4">
        {[
          ["Compra", formatNumber(bid)],
          ["Venta", formatNumber(ask)],
          ["Spread", `${spread.toFixed(2)}%`],
          ["Rango 24h", `${formatNumber(min)} - ${formatNumber(max)}`],
        ].map(([label, value], index) => (
          <div key={label} className={cn("px-5 py-4", index > 0 && "border-l border-border")}>
            <p className="text-muted-foreground">{label}</p>
            <p className="mt-1 truncate font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DecoCalculatorExperience() {
  const [amountInput, setAmountInput] = React.useState("100")
  const [fromCode, setFromCode] = React.useState("USD")
  const [toCode, setToCode] = React.useState("COP")
  const amount = Number(amountInput.replace(",", ".")) || 0
  const from = calculatorAssets.find((asset) => asset.code === fromCode) ?? calculatorAssets[0]
  const to = calculatorAssets.find((asset) => asset.code === toCode) ?? calculatorAssets[1]
  const rate = from.usdValue / to.usdValue
  const estimated = amount * rate

  function handleSwap() {
    setFromCode(to.code)
    setToCode(from.code)
  }

  function handleFromChange(code: string) {
    setFromCode(code)

    if (code === toCode) {
      const nextTo = calculatorAssets.find((asset) => asset.code !== code)
      setToCode(nextTo?.code ?? "COP")
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
      <div className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none">
        <CalculatorReferenceChart amount={amount} estimated={estimated} from={from} rate={rate} to={to} />
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ArrowRightLeft className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-black text-foreground">Convierte con claridad</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Elige monto, origen y destino. La grafica se recalcula con el par seleccionado.
        </p>

        <label className="mt-7 block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Monto</span>
          <input
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            inputMode="decimal"
            className="mt-3 h-14 w-full rounded-full border border-border bg-background px-5 text-xl font-black text-foreground outline-none transition-colors focus:border-primary"
          />
        </label>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Invertir monedas"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-6">
          <CalculatorAssetPicker assets={calculatorAssets} label="Origen" value={fromCode} onChange={handleFromChange} />
          <CalculatorAssetPicker assets={calculatorAssets.filter((asset) => asset.code !== fromCode)} label="Destino" value={toCode} onChange={setToCode} />
        </div>

        <div className="mt-7 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Resultado estimado</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {formatNumber(estimated, to.code)} {to.code}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            1 {from.code} = {formatNumber(rate)} {to.code}
          </p>
        </div>
      </div>
    </section>
  )
}
