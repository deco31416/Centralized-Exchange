import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EarnHero({
  aside,
  description,
  eyebrow = "Ganar",
  title,
}: {
  aside?: ReactNode
  description: string
  eyebrow?: string
  title: string
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-6xl">{title}</h1>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-xl">{description}</p>
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  )
}

export function EarnHeroStat({
  description,
  label,
  value,
}: {
  description: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{label}</p>
      <p className="mt-2 text-3xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

export function EarnMetricCard({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card/90 p-4 dark:bg-white/[0.035]">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

export function EarnPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]", className)}>
      {children}
    </section>
  )
}

export function EarnProgramCard({
  cta,
  description,
  detail,
  eyebrow,
  href,
  icon,
  metric,
  status,
  title,
}: {
  cta: string
  description: string
  detail: string
  eyebrow: string
  href: string
  icon?: ReactNode
  metric: string
  status: string
  title: string
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[210px] flex-col justify-between rounded-[var(--radius)] border border-border bg-background p-4 text-left transition-colors hover:bg-muted/45"
    >
      <span>
        <span className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">
            {icon}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-muted-foreground">{status}</span>
        </span>
        <span className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</span>
        <span className="mt-1 block text-xl font-black text-foreground">{title}</span>
        <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{description}</span>
      </span>
      <span className="mt-5 flex items-end justify-between gap-3">
        <span>
          <span className="block text-sm font-black text-foreground">{metric}</span>
          <span className="block text-xs text-muted-foreground">{detail}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-black text-foreground">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  )
}

export function EarnSummary({
  actionHref,
  actionText,
  children,
  eyebrow,
  title,
}: {
  actionHref?: string
  actionText?: string
  children: ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <EarnPanel>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-foreground">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
      {actionHref && actionText ? (
        <Button asChild className="mt-5 w-full rounded-full">
          <Link href={actionHref}>{actionText}</Link>
        </Button>
      ) : null}
    </EarnPanel>
  )
}

export function EarnSummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-black text-foreground">{value}</span>
    </div>
  )
}

export function EarnTimeline({
  events,
}: {
  events: Array<{
    date: string
    detail: string
    id: string
    status: string
    title: string
  }>
}) {
  return (
    <EarnPanel>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Movimiento</p>
      <h2 className="mt-2 text-2xl font-black text-foreground">Ruta de trabajo</h2>
      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-foreground">{event.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{event.detail}</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{event.date}</span>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">{event.status}</p>
          </div>
        ))}
      </div>
    </EarnPanel>
  )
}

export function EarnModal({
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Ganar</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-card hover:text-foreground"
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
