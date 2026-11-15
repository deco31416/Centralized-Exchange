"use client"

import * as React from "react"
import { ArrowRight, MapPin, Search, Send, ShieldCheck, UserCheck, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { Button } from "@/components/ui/button"
import { FiatCurrencyIcon } from "@/components/common/fiat-currency-icon"
import { LocalePreferencesModal } from "@/components/common/language/locale-preferences-modal"
import { localeLanguages, regions } from "@/components/common/language/locale-options"
import { useBolsillitoPreferences } from "@/components/bolsillito/shared/use-bolsillito-preferences"
import { SendConfirmationModal } from "./modals/send-confirmation-modal"
import { getSendQuickAmounts, mockRecipients, type SendRecipient } from "./send-money-options"

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

function RecipientGrid({
  selectedRecipient,
  onSelect,
}: {
  selectedRecipient: SendRecipient | null
  onSelect: (recipient: SendRecipient) => void
}) {
  const [query, setQuery] = React.useState("")
  const filteredRecipients = mockRecipients.filter((recipient) => {
    const q = query.trim().toLowerCase()
    return !q || recipient.name.toLowerCase().includes(q) || recipient.handle.toLowerCase().includes(q)
  })

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.03] dark:shadow-none">
      <div className="mb-3 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-2">
        <label className="flex h-10 w-full items-center gap-2 rounded-full border border-foreground bg-foreground px-4 text-sm text-background shadow-sm ring-1 ring-foreground/10 sm:w-[250px]">
          <Search className="h-4 w-4 shrink-0 text-background/80" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar usuario"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-background/75"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {filteredRecipients.map((recipient) => {
          const active = selectedRecipient?.id === recipient.id
          return (
            <button
              key={recipient.id}
              type="button"
              onClick={() => onSelect(recipient)}
              className={cn(
                "relative flex min-h-[96px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-card/70",
                active && "bg-primary/[0.035]"
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
              <span className="min-w-0 pl-1">
                <span className="block text-sm font-black leading-tight text-foreground">{recipient.name}</span>
                <span className="mt-1 block text-xs leading-tight text-muted-foreground">{recipient.handle}</span>
              </span>
              <span className="truncate pl-1 text-[11px] font-semibold text-muted-foreground">{recipient.detail}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AmountPanel({
  amount,
  currency,
  onAmountChange,
}: {
  amount: string
  currency: string
  onAmountChange: (value: string) => void
}) {
  const quickAmounts = getSendQuickAmounts(currency)

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-foreground">Monto a enviar</p>
          <p className="text-sm text-muted-foreground">Transferencia interna entre usuarios.</p>
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

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => onAmountChange(String(quickAmount))}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
          >
            {quickAmount.toLocaleString("es-CO")} {currency}
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryPanel({
  amount,
  currency,
  recipient,
}: {
  amount: string
  currency: string
  recipient: SendRecipient | null
}) {
  const numericAmount = Number(amount) || 0

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
        <div className="mb-4 flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black text-foreground">Resumen de envío</h2>
        </div>
        <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Enviarás</p>
          <p className="mt-2 text-3xl font-black text-foreground">
            {numericAmount.toLocaleString("es-CO", { maximumFractionDigits: 2 })} {currency}
          </p>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Destinatario</span>
            <span className="text-right font-semibold text-foreground">{recipient?.name ?? "Selecciona usuario"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Tipo</span>
            <span className="text-right font-semibold text-foreground">Interna</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Firma</span>
            <span className="text-right font-semibold text-foreground">PIN / clave dinámica</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
          <Wallet className="mb-2 h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p className="text-lg font-black text-foreground">$0.00</p>
        </div>
        <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
          <ShieldCheck className="mb-2 h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">Seguridad</p>
          <p className="text-lg font-black text-foreground">PIN</p>
        </div>
      </div>
    </aside>
  )
}

export default function SendMoneyPage() {
  const preferences = useBolsillitoPreferences()
  const [selectedRecipient, setSelectedRecipient] = React.useState<SendRecipient | null>(mockRecipients[0])
  const [amount, setAmount] = React.useState("10000")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const selectedLanguage = localeLanguages.find((item) => item.value === preferences.language)
  const selectedRegion = regions.find((item) => item.value === preferences.region) ?? regions[0]
  const numericAmount = Number(amount) || 0

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section>
          <div className="mb-6 overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Bolsillito</p>
                <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">Envía saldo</h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Mueve saldo fiat entre usuarios de Deco Exchange con firma de operación.
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
            <StepPill active={!!selectedRecipient} label="Destinatario" number="01" />
            <StepPill active={numericAmount > 0} label="Monto" number="02" />
            <StepPill active={!!selectedRecipient && numericAmount > 0} label="Confirmación" number="03" />
          </div>

          <div className="space-y-5">
            <RecipientGrid selectedRecipient={selectedRecipient} onSelect={setSelectedRecipient} />
            <AmountPanel amount={amount} currency={preferences.currency} onAmountChange={setAmount} />

            <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <UserCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-foreground">Siguiente paso</p>
                    <p className="text-sm text-muted-foreground">Se revisará destinatario, saldo disponible y firma.</p>
                  </div>
                </div>
                <Button
                  disabled={!selectedRecipient || numericAmount <= 0}
                  onClick={() => setConfirmOpen(true)}
                  className="h-12 rounded-full px-7 text-sm font-black"
                >
                  Revisar envío
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <SummaryPanel amount={amount} currency={preferences.currency} recipient={selectedRecipient} />
        <SendConfirmationModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          recipient={selectedRecipient}
          amount={numericAmount}
          currency={preferences.currency}
        />
      </main>
    </ActionPageShell>
  )
}
