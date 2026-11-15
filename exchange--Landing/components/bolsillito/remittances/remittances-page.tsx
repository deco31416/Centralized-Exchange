"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, ArrowRightLeft, Building2, Globe2, MapPin, Search, ShieldCheck, Timer } from "lucide-react"

import { cn } from "@/lib/utils"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { Button } from "@/components/ui/button"
import { FiatCurrencyIcon } from "@/components/common/fiat-currency-icon"
import { LocalePreferencesModal } from "@/components/common/language/locale-preferences-modal"
import { localeLanguages, regions } from "@/components/common/language/locale-options"
import { useBolsillitoPreferences } from "@/components/bolsillito/shared/use-bolsillito-preferences"
import { RemittanceQuoteModal } from "./modals/remittance-quote-modal"
import {
  estimateRemittanceReceive,
  getRemittanceQuickAmounts,
  remittanceRoutes,
  type RemittanceRoute,
} from "./remittances-options"

function StepPill({ active, label, number }: { active?: boolean; label: string; number: string }) {
  return (
    <div
      className={cn(
        "grid min-h-[46px] grid-cols-[42px_1fr] items-center rounded-[calc(var(--radius)-0.75rem)] border border-transparent px-4 text-sm font-bold text-muted-foreground transition-all",
        active && "border-border bg-background text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:bg-white/[0.075] dark:shadow-none"
      )}
    >
      <span className="font-mono text-[11px] font-black tracking-[0.18em] text-primary">{number}</span>
      <span className="text-left">{label}</span>
    </div>
  )
}

function RouteGrid({
  selectedRoute,
  onSelect,
}: {
  selectedRoute: RemittanceRoute
  onSelect: (route: RemittanceRoute) => void
}) {
  const [query, setQuery] = React.useState("")
  const filteredRoutes = remittanceRoutes.filter((route) => {
    const q = query.trim().toLowerCase()
    return !q || route.country.toLowerCase().includes(q) || route.currency.toLowerCase().includes(q)
  })

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.03] dark:shadow-none">
      <div className="mb-3 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-2">
        <label className="flex h-10 w-full items-center gap-2 rounded-full border border-foreground bg-foreground px-4 text-sm text-background shadow-sm ring-1 ring-foreground/10 sm:w-[250px]">
          <Search className="h-4 w-4 shrink-0 text-background/80" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar destino"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-background/75"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {filteredRoutes.map((route) => {
          const active = selectedRoute.id === route.id
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onSelect(route)}
              className={cn(
                "relative flex min-h-[96px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-card/70",
                active && "bg-primary/[0.035]"
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
              <span className="min-w-0 pl-1">
                <span className="block text-sm font-black leading-tight text-foreground">{route.country}</span>
                <span className="mt-1 block text-xs leading-tight text-muted-foreground">{route.rateLabel}</span>
              </span>
              <span className="flex min-w-0 items-center justify-between gap-2 pl-1 text-[11px] font-semibold text-muted-foreground">
                <span className="truncate">{route.fee}</span>
                <span className="shrink-0 text-foreground">{route.time}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AmountPanel({
  amount,
  sourceCurrency,
  destinationCurrency,
  receiveAmount,
  onAmountChange,
}: {
  amount: string
  sourceCurrency: string
  destinationCurrency: string
  receiveAmount: number
  onAmountChange: (value: string) => void
}) {
  const quickAmounts = getRemittanceQuickAmounts(sourceCurrency)

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-foreground">Monto de remesa</p>
          <p className="text-sm text-muted-foreground">Cotización referencial para el mockup.</p>
        </div>
        <div className="flex items-center gap-2">
          <FiatCurrencyIcon code={sourceCurrency} className="h-9 w-9" />
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <FiatCurrencyIcon code={destinationCurrency} className="h-9 w-9" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex min-h-[72px] items-center gap-3 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background px-4">
          <span className="text-3xl font-black text-muted-foreground">$</span>
          <input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0.00"
            className="min-w-0 flex-1 bg-transparent text-4xl font-black tracking-normal text-foreground outline-none placeholder:text-muted-foreground/35"
          />
          <span className="text-lg font-black text-foreground">{sourceCurrency}</span>
        </div>

        <div className="flex min-h-[72px] flex-col justify-center rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background px-4">
          <p className="text-xs font-semibold text-muted-foreground">Reciben aprox.</p>
          <p className="text-2xl font-black text-foreground">
            {receiveAmount.toLocaleString("es-CO", { maximumFractionDigits: 2 })} {destinationCurrency}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => onAmountChange(String(quickAmount))}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
          >
            {quickAmount.toLocaleString("es-CO")} {sourceCurrency}
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryPanel({
  route,
  amount,
  sourceCurrency,
  receiveAmount,
}: {
  route: RemittanceRoute
  amount: string
  sourceCurrency: string
  receiveAmount: number
}) {
  const numericAmount = Number(amount) || 0

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
        <div className="mb-4 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black text-foreground">Resumen de remesa</h2>
        </div>
        <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Destino</p>
          <p className="mt-2 text-2xl font-black text-foreground">{route.country}</p>
          <p className="text-sm text-muted-foreground">{route.rateLabel}</p>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Envías</span>
            <span className="font-semibold text-foreground">{numericAmount.toLocaleString("es-CO")} {sourceCurrency}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Reciben</span>
            <span className="font-semibold text-foreground">{receiveAmount.toLocaleString("es-CO", { maximumFractionDigits: 2 })} {route.currency}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Tiempo</span>
            <span className="font-semibold text-foreground">{route.time}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-3 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
          <Timer className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Cotización temporal</span>
        </div>
        <div className="flex items-center gap-3 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Revisión de cumplimiento</span>
        </div>
      </div>
    </aside>
  )
}

function RedDecoRemittanceCallout() {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
      <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Red Deco</p>
          <h2 className="mt-1 text-xl font-black text-foreground">Enviar con aliado físico</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Paga en efectivo con un Aliado Deco y deja que Deco enrute la remesa por banco, wallet, P2P o aliado destino.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 rounded-full">
          <Link href="/bolsillito/red-deco/remittance">
            Usar Red Deco
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function RemittancesPage() {
  const preferences = useBolsillitoPreferences()
  const [selectedRoute, setSelectedRoute] = React.useState(remittanceRoutes[0])
  const [amount, setAmount] = React.useState("100000")
  const [quoteOpen, setQuoteOpen] = React.useState(false)
  const selectedLanguage = localeLanguages.find((item) => item.value === preferences.language)
  const selectedRegion = regions.find((item) => item.value === preferences.region) ?? regions[0]
  const numericAmount = Number(amount) || 0
  const receiveAmount = estimateRemittanceReceive(numericAmount, selectedRoute.currency)

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section>
          <div className="mb-6 overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Bolsillito</p>
                <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Remesas</h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Envía dinero entre países desde tu saldo fiat con cotización y trazabilidad.
                </p>
              </div>
              <LocalePreferencesModal>
                <Button variant="outline" className="h-11 rounded-full">
                  <MapPin className="h-4 w-4" />
                  Cambiar país y moneda
                </Button>
              </LocalePreferencesModal>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="rounded-full border border-border bg-background px-3 py-1.5">
                {selectedLanguage?.label ?? preferences.language.toUpperCase()}
              </span>
              <span className="rounded-full border border-border bg-background px-3 py-1.5">{selectedRegion.label}</span>
              <span className="rounded-full border border-border bg-background px-3 py-1.5">{preferences.currency}</span>
            </div>
          </div>

          <div className="mb-5 grid gap-1 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-muted/35 p-1 dark:bg-white/[0.035] md:grid-cols-3">
            <StepPill active label="Destino" number="01" />
            <StepPill active={numericAmount > 0} label="Monto" number="02" />
            <StepPill active={numericAmount > 0} label="Cotización" number="03" />
          </div>

          <div className="space-y-5">
            <RedDecoRemittanceCallout />
            <RouteGrid selectedRoute={selectedRoute} onSelect={setSelectedRoute} />
            <AmountPanel
              amount={amount}
              sourceCurrency={preferences.currency}
              destinationCurrency={selectedRoute.currency}
              receiveAmount={receiveAmount}
              onAmountChange={setAmount}
            />

            <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <ArrowRightLeft className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-foreground">Siguiente paso</p>
                    <p className="text-sm text-muted-foreground">Se reservará una tasa referencial para el mockup.</p>
                  </div>
                </div>
                <Button
                  disabled={numericAmount <= 0}
                  onClick={() => setQuoteOpen(true)}
                  className="h-12 rounded-full px-7 text-sm font-black"
                >
                  Cotizar remesa
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <SummaryPanel
          route={selectedRoute}
          amount={amount}
          sourceCurrency={preferences.currency}
          receiveAmount={receiveAmount}
        />
        <RemittanceQuoteModal
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          route={selectedRoute}
          sendAmount={numericAmount}
          sourceCurrency={preferences.currency}
          receiveAmount={receiveAmount}
        />
      </main>
    </ActionPageShell>
  )
}
