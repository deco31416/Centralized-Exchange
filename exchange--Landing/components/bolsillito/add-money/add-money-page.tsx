"use client"

import * as React from "react"
import { ArrowRight, Clock3, MapPin, ReceiptText, Search, ShieldCheck, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { Button } from "@/components/ui/button"
import { FiatCurrencyIcon } from "@/components/common/fiat-currency-icon"
import { LocalePreferencesModal } from "@/components/common/language/locale-preferences-modal"
import { localeLanguages, regions } from "@/components/common/language/locale-options"
import { getAddMoneyLimit } from "./add-money-limits"
import { DepositFlowModal } from "./modals/deposit-flow-modal"
import { getAddMoneyMethods, getQuickAmounts, receiptItems } from "./add-money-options"
import { useAddMoneyPreferences } from "./use-add-money-preferences"

const methodCategories = [
  { id: "all", label: "Todos" },
  { id: "bank", label: "Bancos" },
  { id: "electronic", label: "Electrónicos" },
  { id: "cash", label: "Efectivo" },
  { id: "card", label: "Tarjetas" },
] as const

function StepPill({ active, done, label, number }: { active?: boolean; done?: boolean; label: string; number: string }) {
  return (
    <div
      className={cn(
        "grid min-h-[46px] grid-cols-[42px_1fr] items-center rounded-[calc(var(--radius)-0.75rem)] border border-transparent px-4 text-sm font-bold text-muted-foreground transition-all",
        active && "border-border bg-background text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:bg-white/[0.075] dark:shadow-none",
        done && !active && "text-foreground"
      )}
    >
      <span
        className={cn(
          "font-mono text-[11px] font-black tracking-[0.18em] text-primary",
          active && "text-primary"
        )}
      >
        {number}
      </span>
      <span className="text-left">{label}</span>
    </div>
  )
}

function RegionCard({ regionCode, currency }: { regionCode: string; currency: string }) {
  const region = regions.find((item) => item.value === regionCode) ?? regions[0]
  const Flag = region.Flag

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)-0.35rem)] border border-border bg-card/90 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative block h-8 w-12 shrink-0 overflow-hidden rounded-[0.3rem] border border-border bg-background">
            <Flag title={region.label} className="absolute inset-0 h-full w-full object-cover" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-foreground">{region.label}</p>
            <p className="truncate text-xs text-muted-foreground">{region.note}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
          <span className="text-sm font-black text-foreground">{currency}</span>
        </div>
      </div>
    </div>
  )
}

function MethodGrid({
  selectedMethod,
  onSelect,
  region,
}: {
  selectedMethod: string
  onSelect: (method: string) => void
  region: string
}) {
  const [category, setCategory] = React.useState<(typeof methodCategories)[number]["id"]>("all")
  const [query, setQuery] = React.useState("")
  const methods = getAddMoneyMethods(region)
  const filteredMethods = methods.filter((method) => {
    const matchesCategory = category === "all" || method.category === category
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery =
      !normalizedQuery ||
      method.title.toLowerCase().includes(normalizedQuery) ||
      method.description.toLowerCase().includes(normalizedQuery) ||
      method.network.toLowerCase().includes(normalizedQuery)

    return matchesCategory && matchesQuery
  })

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.03] dark:shadow-none">
      <div className="mb-3 flex flex-col gap-2 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex h-10 w-full items-center gap-2 rounded-full border border-foreground bg-foreground px-4 text-sm text-background shadow-sm ring-1 ring-foreground/10 transition-colors sm:w-[250px]">
            <Search className="h-4 w-4 shrink-0 text-background/80" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar método"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-background/75"
            />
          </label>

          <div className="flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
            {methodCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-xs font-bold text-muted-foreground transition-colors",
                  category === item.id && "bg-foreground text-background"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid max-h-[430px] grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3 xl:grid-cols-4">
        {filteredMethods.map((method) => {
          const active = selectedMethod === method.id

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "relative flex min-h-[96px] w-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-card/70",
                active && "bg-primary/[0.035]"
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
              <span className="min-w-0 pl-1">
                <span className="block text-sm font-black leading-tight text-foreground">{method.title}</span>
                <span className="mt-1 block text-xs leading-tight text-muted-foreground">{method.description}</span>
              </span>
              <span className="flex min-w-0 items-center justify-between gap-2 pl-1 text-[11px] font-semibold text-muted-foreground">
                <span className="truncate">{method.network}</span>
                <span className="shrink-0 text-foreground">{method.time}</span>
              </span>
            </button>
          )
        })}
        {filteredMethods.length === 0 && (
          <div className="rounded-[calc(var(--radius)-0.55rem)] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
            No hay métodos en esta categoría para el país seleccionado.
          </div>
        )}
      </div>
    </div>
  )
}

function AmountPanel({
  amount,
  currency,
  onAmountChange,
  minLabel,
  isBelowMinimum,
}: {
  amount: string
  currency: string
  onAmountChange: (value: string) => void
  minLabel: string
  isBelowMinimum: boolean
}) {
  const quickAmounts = getQuickAmounts(currency)

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-foreground">Monto de recarga</p>
          <p className="text-sm text-muted-foreground">Depósito mínimo: {minLabel}</p>
        </div>
        <FiatCurrencyIcon code={currency} className="h-10 w-10" />
      </div>

      <div className="flex min-h-[72px] items-center gap-3 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background px-4">
        <span className="text-3xl font-black text-muted-foreground">$</span>
        <input
          value={amount}
          onChange={(event) => onAmountChange(event.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          placeholder="0.00"
          className="min-w-0 flex-1 bg-transparent text-4xl font-black tracking-normal text-foreground outline-none placeholder:text-muted-foreground/35"
        />
        <span className="text-lg font-black text-foreground">{currency}</span>
      </div>

      {isBelowMinimum && (
        <p className="mt-2 text-sm font-semibold text-primary">
          El monto mínimo para recargar en {currency} es {minLabel}.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => onAmountChange(String(quickAmount))}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {quickAmount} {currency}
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryPanel({
  amount,
  currency,
  methodTitle,
  methodTime,
  methodFee,
}: {
  amount: string
  currency: string
  methodTitle: string
  methodTime: string
  methodFee: string
}) {
  const numericAmount = Number(amount) || 0

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
        <div className="mb-4 flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black text-foreground">Resumen de recarga</h2>
        </div>
        <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recibirás</p>
          <p className="mt-2 text-3xl font-black text-foreground">
            {numericAmount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {receiptItems.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="max-w-[190px] text-right font-semibold text-foreground">
                {item.label === "Metodo" ? methodTitle : item.label === "Confirmacion" ? methodTime : methodFee || item.fallback}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
        <div className="mb-3 flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black text-foreground">Flujo de recarga</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. Elige el metodo disponible para tu país.</p>
          <p>2. Generamos instrucciones y referencia única.</p>
          <p>3. Confirmas el pago y el saldo aparece en tu Bolsillito.</p>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black text-foreground">Nivel 2 · Listo para usar</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Los métodos y límites se adaptan a país, moneda y disponibilidad regulatoria.
        </p>
      </div>
    </aside>
  )
}

export default function AddMoneyPage() {
  const preferences = useAddMoneyPreferences()
  const [amount, setAmount] = React.useState("10000")
  const [depositModalOpen, setDepositModalOpen] = React.useState(false)
  const methods = React.useMemo(() => getAddMoneyMethods(preferences.region), [preferences.region])
  const [selectedMethod, setSelectedMethod] = React.useState(methods[0]?.id ?? "")
  const selectedLanguage = localeLanguages.find((item) => item.value === preferences.language)
  const selectedRegion = regions.find((item) => item.value === preferences.region) ?? regions[0]
  const limit = getAddMoneyLimit(preferences.currency)
  const numericAmount = Number(amount) || 0
  const isBelowMinimum = numericAmount > 0 && numericAmount < limit.min

  React.useEffect(() => {
    setSelectedMethod(getAddMoneyMethods(preferences.region)[0]?.id ?? "")
  }, [preferences.region])

  React.useEffect(() => {
    const nextLimit = getAddMoneyLimit(preferences.currency)
    setAmount((current) => {
      const parsed = Number(current) || 0
      return parsed < nextLimit.min ? String(nextLimit.min) : current
    })
  }, [preferences.currency])

  const method = methods.find((item) => item.id === selectedMethod) ?? methods[0]

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section>
          <div className="mb-6 overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Bolsillito</p>
                <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Recarga saldo</h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Elige país, método y monto. La disponibilidad se adapta a las preferencias del usuario.
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
              <span className="rounded-full border border-border bg-background px-3 py-1.5">
                {selectedRegion.label}
              </span>
              <span className="rounded-full border border-border bg-background px-3 py-1.5">
                {preferences.currency}
              </span>
            </div>
          </div>

          <div className="mb-5 grid gap-1 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-muted/35 p-1 dark:bg-white/[0.035] md:grid-cols-3">
            <StepPill active done label="País y moneda" number="01" />
            <StepPill active={!!selectedMethod} done={!!selectedMethod} label="Método de pago" number="02" />
            <StepPill active={Number(amount) > 0} label="Monto y referencia" number="03" />
          </div>

          <div className="space-y-5">
            <RegionCard key={`${preferences.region}-${preferences.currency}`} regionCode={preferences.region} currency={preferences.currency} />
            {selectedRegion.currency !== preferences.currency && (
              <div className="rounded-[calc(var(--radius)-0.35rem)] border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                Tu país opera por defecto en <span className="font-bold text-foreground">{selectedRegion.currency}</span>, pero estás viendo la recarga en{" "}
                <span className="font-bold text-foreground">{preferences.currency}</span> porque así quedó configurada tu moneda preferida.
              </div>
            )}

            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-foreground">Métodos disponibles</h2>
                  <p className="text-sm text-muted-foreground">Opciones activas para {preferences.region} · {preferences.currency}</p>
                </div>
              </div>
              <MethodGrid selectedMethod={selectedMethod} onSelect={setSelectedMethod} region={preferences.region} />
            </div>

            <AmountPanel
              amount={amount}
              currency={preferences.currency}
              onAmountChange={setAmount}
              minLabel={limit.label}
              isBelowMinimum={isBelowMinimum}
            />

            <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-foreground">Siguiente paso</p>
                    <p className="text-sm text-muted-foreground">Se generará una referencia para completar la recarga.</p>
                  </div>
                </div>
                <Button
                  disabled={!method || numericAmount < limit.min}
                  onClick={() => setDepositModalOpen(true)}
                  className="h-12 rounded-full px-7 text-sm font-black"
                >
                  Generar instrucciones
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <SummaryPanel
          amount={amount}
          currency={preferences.currency}
          methodTitle={method?.title ?? "Selecciona un metodo"}
          methodTime={method?.time ?? "Segun red local"}
          methodFee={method?.fee ?? "Se muestra antes de confirmar"}
        />
        <DepositFlowModal
          open={depositModalOpen}
          onOpenChange={setDepositModalOpen}
          method={method ?? null}
          amount={numericAmount}
          currency={preferences.currency}
          regionLabel={selectedRegion.label}
        />
      </main>
    </ActionPageShell>
  )
}
