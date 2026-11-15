"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowRightLeft, BarChart3, Info, ShieldCheck } from "lucide-react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"

type ReferenceStat = {
  label: string
  value: string
  detail: string
}

type ReferenceItem = {
  title: string
  description: string
  Icon: LucideIcon
}

type TrendItem = {
  label: string
  value: string
  detail: string
}

type DecoReferencePageProps = {
  eyebrow: string
  title: string
  description: string
  breadcrumb: string
  chartLabel: string
  chartValue: string
  chartDelta: string
  calculatorTitle?: string
  calculatorDescription?: string
  statsTitle: string
  stats: ReferenceStat[]
  itemsTitle: string
  items: ReferenceItem[]
  trendTitle?: string
  trends?: TrendItem[]
  noteTitle: string
  note: string
  ctaHref?: string
  ctaLabel?: string
  leadSlot?: ReactNode
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

function formatReferenceNumber(value: number) {
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
  if (value >= 10) return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 })
}

function getReferenceBaseValue(value: string) {
  const numericValue = Number(value.replace(/[^0-9.-]/g, ""))

  if (Number.isFinite(numericValue) && numericValue > 0) return numericValue
  if (value.toLowerCase().includes("wallet")) return 92
  if (value.toLowerCase().includes("latam")) return 72
  if (value.toLowerCase().includes("kyb") || value.toLowerCase().includes("kyc")) return 86
  if (value.toLowerCase().includes("btc")) return 65000
  return 100
}

function getReferenceSeries(label: string, value: string) {
  const base = getReferenceBaseValue(value)
  const seed = `${label}${value}`.split("").reduce((total, character) => total + character.charCodeAt(0), 0)
  const labels = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]

  return labels.map((pointLabel, index) => {
    const trend = (index - 5.5) * 0.002
    const wave = Math.sin((index + (seed % 11)) * 0.68) * 0.007
    const pulse = Math.cos((index * 1.18 + seed) * 0.38) * 0.004

    return {
      label: pointLabel,
      value: base * (1 + trend + wave + pulse),
    }
  })
}

function ReferenceChart({ label, value, delta }: { label: string; value: string; delta: string }) {
  const series = getReferenceSeries(label, value)
  const width = 860
  const height = 300
  const chartTop = 24
  const chartBottom = 236
  const left = 24
  const right = 104
  const plotWidth = width - left - right
  const values = series.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padding = range * 0.2
  const low = min - padding
  const high = max + padding
  const y = (pointValue: number) => chartBottom - ((pointValue - low) / (high - low || 1)) * (chartBottom - chartTop)
  const xStep = plotWidth / Math.max(series.length - 1, 1)
  const coordinates = series.map((point, index) => ({ x: left + index * xStep, y: y(point.value) }))
  const linePath = buildSmoothPath(coordinates)
  const areaPath = `${linePath} L ${left + plotWidth} ${chartBottom} L ${left} ${chartBottom} Z`
  const lastPoint = series[series.length - 1]
  const previousPoint = series[Math.max(series.length - 2, 0)]
  const change = ((lastPoint.value - previousPoint.value) / previousPoint.value) * 100
  const isUp = change >= 0
  const yTicks = [high, low + (high - low) / 2, low]

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Referencia Deco</p>
          <p className="mt-1 text-sm text-muted-foreground">Serie visual lista para API y fuente real.</p>
        </div>
        <div className="rounded-full border border-border bg-card px-3 py-1 text-sm font-black text-foreground">
          <span className={isUp ? "text-emerald-500" : "text-red-500"}>
            {isUp ? "+" : ""}
            {change.toFixed(2)}%
          </span>
          <span className="text-muted-foreground"> · 24h</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[300px] w-full" role="img" aria-label={`Gráfica ${label}`}>
        <defs>
          <linearGradient id={`legalReferenceFade-${label.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff6c02" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff6c02" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={left + plotWidth} y1={y(tick)} y2={y(tick)} className="stroke-border opacity-70" strokeDasharray="4 12" />
            <text x={width - 18} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground text-[12px] font-bold">
              {formatReferenceNumber(tick)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill={`url(#legalReferenceFade-${label.replace(/[^a-zA-Z0-9]/g, "")})`} />
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
          ["Fuente", "Deco"],
          ["Referencia", value],
          ["Señal", delta],
          ["Rango", `${formatReferenceNumber(min)} - ${formatReferenceNumber(max)}`],
        ].map(([itemLabel, itemValue], index) => (
          <div key={itemLabel} className={`px-4 py-3 ${index > 0 ? "border-l border-border" : ""}`}>
            <p className="text-muted-foreground">{itemLabel}</p>
            <p className="mt-1 truncate font-black text-foreground">{itemValue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReferenceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-border bg-card shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none ${className}`}
    >
      {children}
    </div>
  )
}

export function DecoReferencePage({
  eyebrow,
  title,
  description,
  breadcrumb,
  chartLabel,
  chartValue,
  chartDelta,
  calculatorTitle = "Calculadora DECO",
  calculatorDescription = "Consulta valores referenciales antes de realizar una operación.",
  statsTitle,
  stats,
  itemsTitle,
  items,
  trendTitle = "Referencias rápidas",
  trends = [],
  noteTitle,
  note,
  ctaHref = "/#tasas",
  ctaLabel = "Abrir calculadora",
  leadSlot,
}: DecoReferencePageProps) {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">{title}</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        <Breadcrumb
          items={[
            { label: "Legales", href: "/legals" },
            { label: breadcrumb, href: "#", active: true },
          ]}
          className="mb-10"
        />

        <section className="mb-12 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-[#ff6c02]">{eyebrow}</p>
          <h2 className="mx-auto max-w-5xl text-4xl font-black leading-tight tracking-normal text-foreground md:text-6xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
            {description}
          </p>
        </section>

        {leadSlot ?? (
          <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <ReferenceCard className="p-6 md:p-8">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{chartLabel}</p>
                  <p className="mt-2 text-4xl font-black text-foreground">{chartValue}</p>
                  <p className="mt-2 text-sm font-semibold text-green-500">{chartDelta}</p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground">
                  Referencial
                </span>
              </div>
              <ReferenceChart label={chartLabel} value={chartValue} delta={chartDelta} />
            </ReferenceCard>

            <ReferenceCard className="p-6 md:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6c02] text-white">
                <ArrowRightLeft className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-foreground">{calculatorTitle}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{calculatorDescription}</p>

              <div className="mt-7 space-y-4">
                <div className="rounded-[calc(var(--radius)-0.35rem)] border border-border bg-background p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Monto</p>
                  <div className="mt-1 flex items-center justify-between text-xl font-black text-foreground">
                    <span>100.00</span>
                    <span>USD</span>
                  </div>
                </div>
                <div className="rounded-[calc(var(--radius)-0.35rem)] border border-border bg-background p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Recibes</p>
                  <div className="mt-1 flex items-center justify-between text-xl font-black text-foreground">
                    <span>400,000.00</span>
                    <span>COP</span>
                  </div>
                </div>
                <Link
                  href={ctaHref}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ff6c02] px-6 text-sm font-bold text-white transition-colors hover:bg-[#ff6c02]/90"
                >
                  {ctaLabel}
                </Link>
              </div>
            </ReferenceCard>
          </section>
        )}

        <section className="my-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <ReferenceCard className="p-6 md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-[#ff6c02]" />
              <h3 className="text-2xl font-black text-foreground">{statsTitle}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[calc(var(--radius)-0.35rem)] border border-border bg-background p-5">
                  <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                </div>
              ))}
            </div>
          </ReferenceCard>

          <ReferenceCard className="p-6 md:p-8">
            <h3 className="text-2xl font-black text-foreground">{trendTitle}</h3>
            <div className="mt-6 space-y-3">
              {trends.map((trend) => (
                <div key={trend.label} className="flex items-center justify-between rounded-full border border-border bg-background px-4 py-3">
                  <span className="font-bold text-foreground">{trend.label}</span>
                  <span className="text-sm text-muted-foreground">{trend.value}</span>
                  <span className="text-xs font-semibold text-green-500">{trend.detail}</span>
                </div>
              ))}
            </div>
          </ReferenceCard>
        </section>

        <section className="mb-12">
          <ReferenceCard className="p-6 md:p-8">
            <h3 className="mb-6 text-2xl font-black text-foreground">{itemsTitle}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map(({ title: itemTitle, description: itemDescription, Icon }) => (
                <div key={itemTitle} className="rounded-[calc(var(--radius)-0.35rem)] border border-border bg-background p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border text-[#ff6c02]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-black text-foreground">{itemTitle}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{itemDescription}</p>
                </div>
              ))}
            </div>
          </ReferenceCard>
        </section>

        <section className="mb-14">
          <ReferenceCard className="p-8 text-center md:p-12">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border text-[#ff6c02]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#ff6c02]">{noteTitle}</p>
            <p className="mx-auto mt-4 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl">{note}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground">
              <Info className="h-4 w-4" />
              Sin licencia operativa
            </div>
          </ReferenceCard>
        </section>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
