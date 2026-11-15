"use client"

import type { ReactNode } from "react"
import { Loader2, Search, X } from "lucide-react"

import type { FundingMethod } from "@/services/EasyCryptoBuyService"

export function EasyCryptoHero({
  eyebrow = "Crypto facil",
  title,
  description,
  aside,
}: {
  eyebrow?: string
  title: string
  description: string
  aside?: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-foreground md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
        </div>
        {aside ? <div className="lg:w-[340px]">{aside}</div> : null}
      </div>
    </div>
  )
}

export function EasyCryptoHeroStat({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function EasyCryptoSearchInput({
  onChange,
  placeholder = "Buscar",
  value,
}: {
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <label className="flex h-10 w-full items-center gap-2 rounded-full border border-foreground bg-foreground px-4 text-sm text-background shadow-sm ring-1 ring-foreground/10 sm:w-[250px]">
      <Search className="h-4 w-4 shrink-0 text-background/80" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-background/75"
      />
    </label>
  )
}

export function EasyCryptoMethodGrid({
  emptyText,
  isLoading,
  methods,
  onQueryChange,
  onSelect,
  query,
  selectedMethod,
}: {
  emptyText: string
  isLoading: boolean
  methods: FundingMethod[]
  onQueryChange: (value: string) => void
  onSelect: (method: FundingMethod) => void
  query: string
  selectedMethod: FundingMethod | null
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.03] dark:shadow-none">
      <div className="mb-3 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-2">
        <EasyCryptoSearchInput value={query} onChange={onQueryChange} placeholder="Buscar metodo" />
      </div>

      {isLoading ? (
        <div className="flex min-h-[140px] items-center justify-center gap-2 rounded-[calc(var(--radius)-0.55rem)] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando metodos
        </div>
      ) : methods.length > 0 ? (
        <div className="grid max-h-[350px] grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3 xl:grid-cols-4">
          {methods.map((method) => {
            const active = (selectedMethod?.methodCode ?? selectedMethod?.code) === (method.methodCode ?? method.code)

            return (
              <button
                key={`${method.methodCode ?? method.code}-${method.currency}-${method.name}`}
                type="button"
                disabled={!method.enabled}
                onClick={() => method.enabled && onSelect(method)}
                className={[
                  "relative flex min-h-[104px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-card/70 disabled:cursor-not-allowed disabled:opacity-55",
                  active ? "bg-primary/[0.035]" : "",
                ].join(" ")}
              >
                {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
                <span className="min-w-0 pl-1">
                  <span className="block text-sm font-black leading-tight text-foreground">{method.name}</span>
                  <span className="mt-1 block text-xs leading-tight text-muted-foreground">{method.description || method.type || "Metodo disponible"}</span>
                </span>
                <span className="flex min-w-0 items-center justify-between gap-2 pl-1 text-[11px] font-semibold text-muted-foreground">
                  <span className="truncate">{method.settlementTime ?? method.type ?? "Confirmacion"}</span>
                  <span className="shrink-0 text-foreground">{method.currency}</span>
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[calc(var(--radius)-0.55rem)] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
    </div>
  )
}

export function EasyCryptoPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
      {children}
    </div>
  )
}

export function EasyCryptoSummary({
  action,
  children,
  icon,
  title,
}: {
  action?: ReactNode
  children: ReactNode
  icon?: ReactNode
  title: string
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-black text-foreground">{title}</h2>
      </div>
      {children}
      {action}
    </div>
  )
}

export function EasyCryptoMetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon?: ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
      {icon ? <div className="mb-2 text-primary">{icon}</div> : null}
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

export function EasyCryptoConfirmModal({
  children,
  footer,
  onClose,
  open,
  subtitle,
  title,
}: {
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  open: boolean
  subtitle?: string
  title: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-3 py-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-[var(--radius)] border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Confirmacion</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-card hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto p-5">{children}</div>
        {footer ? <div className="border-t border-border p-5">{footer}</div> : null}
      </div>
    </div>
  )
}
