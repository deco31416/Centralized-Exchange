"use client"

import {
  IconAlertTriangle,
  IconChartBar,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { AlertLevel, PriceBand } from "./types"
import { getPriceBandId } from "./types"
import { usePriceBands } from "./use-price-bands"

const alertClass: Record<AlertLevel, string> = {
  SAFE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  WARNING: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  DANGER: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  BLOCKED: "border-red-600/30 bg-red-600/15 text-red-800 dark:text-red-200",
}

function formatPercent(value?: number) {
  if (typeof value !== "number") return "0.00%"
  return `${value.toFixed(2)}%`
}

function bandName(band: PriceBand) {
  if (band.source === "fiat") return band.pairCode ?? "Par fiat"
  return band.assetCode ?? "Activo cripto"
}

function bandSubtitle(band: PriceBand) {
  if (band.source === "fiat") return band.corridorCode ? `Corredor ${band.corridorCode}` : "Corredor global"
  return band.networkCode ? `Red ${band.networkCode}` : "Todas las redes"
}

function SummaryCard({
  title,
  value,
  label,
}: {
  title: string
  value: number
  label: string
}) {
  return (
    <div className="rounded-[1.5rem] border bg-card p-6 shadow-[0_18px_55px_rgba(15,23,42,0.10)] dark:shadow-none">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
      <p className="mt-3 text-sm font-semibold">{label}</p>
    </div>
  )
}

function SpreadBandCard({ band }: { band: PriceBand }) {
  return (
    <article className="rounded-[1.5rem] border bg-background/60 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:bg-black/20 dark:shadow-none">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-card">
            <IconChartBar className="size-5 text-[#ff6c02]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold">{bandName(band)}</h3>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                {band.source === "fiat" ? "Fiat" : "Crypto"}
              </Badge>
              <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${alertClass[band.alertLevel]}`}>
                {band.alertLevel}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{bandSubtitle(band)}</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold">
          {band.mode}
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xs text-muted-foreground">Compra</p>
          <p className="font-semibold">{formatPercent(band.effectiveBuySpread ?? band.buySpreadPercentage)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Venta</p>
          <p className="font-semibold">{formatPercent(band.effectiveSellSpread ?? band.sellSpreadPercentage)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Límite superior</p>
          <p className="font-semibold">{formatPercent(band.legalMaxUpperPercentage)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Límite inferior</p>
          <p className="font-semibold">{formatPercent(-Math.abs(band.legalMaxLowerPercentage))}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Estado</p>
          <p className="font-semibold">{band.enabled ? "Activa" : "Pausada"}</p>
        </div>
      </div>

      {band.alertMessage ? (
        <p className="mt-4 text-sm text-muted-foreground">{band.alertMessage}</p>
      ) : null}
    </article>
  )
}

export function SpreadBandsPage() {
  const { bands, loading, error, summary, reload } = usePriceBands()

  return (
    <div className="space-y-8">
      <PageConnectionHeader
        title="Config de spreads"
        description="Lectura administrativa de bandas fiat/crypto que afectan precios de compra, venta y conversión."
        state={error ? "pending" : "partial"}
        percent={error ? 20 : 40}
        note="La edición queda bloqueada hasta conectar auditoría, aprobación y simulación de impacto."
      />

      {error ? (
        <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Bandas" value={summary.total} label="Spreads configurados" />
        <SummaryCard title="Activas" value={summary.active} label="Impactan precios" />
        <SummaryCard title="Fiat / Crypto" value={summary.fiat + summary.crypto} label={`${summary.fiat} fiat · ${summary.crypto} crypto`} />
        <SummaryCard title="Alertas" value={summary.alerts} label="Requieren revisión" />
      </section>

      <section className="rounded-[1.5rem] border bg-card p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:shadow-none">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff6c02]">
              Spread control
            </p>
            <h2 className="mt-2 text-2xl font-bold">Bandas de precio</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estas bandas se reflejan en tasas, cotizaciones y márgenes visibles para usuario.
            </p>
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void reload()}>
            <IconRefresh className="size-4" />
            Actualizar
          </Button>
        </div>

        <div className="mt-5 rounded-[1.25rem] border bg-background/60 p-4 text-sm text-muted-foreground dark:bg-black/20">
          <div className="flex items-start gap-3">
            <IconShieldCheck className="mt-0.5 size-5 shrink-0 text-[#ff6c02]" />
            <p>
              Custodia guarda fondos reales; ledger refleja saldos operativos. El spread modifica el precio aplicado,
              por eso toda edición futura debe quedar auditada y aprobada.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] border p-8 text-center text-muted-foreground">
              Cargando bandas desde Gateway Admin...
            </div>
          ) : bands.length === 0 ? (
            <div className="rounded-[1.5rem] border p-8 text-center text-muted-foreground">
              No hay bandas de spread configuradas todavía.
            </div>
          ) : (
            bands.map((band) => <SpreadBandCard key={getPriceBandId(band)} band={band} />)
          )}
        </div>
      </section>

      {summary.alerts > 0 ? (
        <div className="rounded-[1.5rem] border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <div className="flex items-start gap-3">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0" />
            <p>Hay bandas fuera de rango seguro. Revisa límites regulatorios antes de habilitar edición.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
