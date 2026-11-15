import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, LockKeyhole, MapPin, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RedDecoHero({
  actionHref,
  actionText,
  aside,
  description,
  eyebrow,
  secondaryHref,
  secondaryText,
  title,
}: {
  actionHref?: string
  actionText?: string
  aside?: ReactNode
  description: string
  eyebrow: string
  secondaryHref?: string
  secondaryText?: string
  title: string
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-foreground md:text-6xl">{title}</h1>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-xl">{description}</p>
          {actionHref && actionText ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link href={actionHref}>{actionText}</Link>
              </Button>
              {secondaryHref && secondaryText ? (
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={secondaryHref}>{secondaryText}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  )
}

export function RedDecoStat({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{label}</p>
      <p className="mt-2 text-3xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  )
}

export function RedDecoPanel({
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

export function RedDecoServiceCard({
  description,
  detail,
  href,
  icon,
  metric,
  title,
}: {
  description: string
  detail: string
  href: string
  icon: ReactNode
  metric: string
  title: string
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[210px] flex-col justify-between rounded-[var(--radius)] border border-border bg-background p-4 text-left transition-colors hover:bg-muted/45"
    >
      <span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary">{icon}</span>
        <span className="mt-4 block text-xl font-black text-foreground">{title}</span>
        <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{description}</span>
      </span>
      <span className="mt-5 flex items-end justify-between gap-3">
        <span>
          <span className="block text-sm font-black text-foreground">{metric}</span>
          <span className="block text-xs text-muted-foreground">{detail}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-black text-foreground">
          Abrir
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  )
}

export function RedDecoSummaryRow({
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

export function RedDecoLocationCard({
  distance,
  hours,
  limit,
  name,
  riskLabel,
  services,
  status,
  type,
  zone,
}: {
  distance: string
  hours: string
  limit: string
  name: string
  riskLabel: string
  services: string[]
  status: string
  type: string
  zone: string
}) {
  return (
    <article className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">{status}</span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">{riskLabel}</span>
          </div>
          <h3 className="mt-3 text-lg font-black text-foreground">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{type}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {services.map((service) => (
              <span key={service} className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-foreground">
                {service}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-2 text-sm md:min-w-[220px]">
          <RedDecoSummaryRow label="Zona" value={zone} />
          <RedDecoSummaryRow label="Distancia" value={distance} />
          <RedDecoSummaryRow label="Horario" value={hours} />
          <RedDecoSummaryRow label="Limite" value={limit} />
        </div>
      </div>
    </article>
  )
}

export function RedDecoSecurityStrip() {
  return (
    <RedDecoPanel className="grid gap-4 md:grid-cols-3 md:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Seguridad</p>
        <h2 className="mt-2 text-2xl font-black text-foreground">Primero zona, luego direccion</h2>
      </div>
      <div className="flex items-start gap-3 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">La direccion exacta se muestra solo cuando la operacion esta aceptada.</p>
      </div>
      <div className="flex items-start gap-3 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">QR dinamico, PIN y comprobante protegen cada cierre presencial.</p>
      </div>
    </RedDecoPanel>
  )
}

export function RedDecoControlCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary">{icon}</div>
      <p className="mt-4 text-sm font-black text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  )
}

export function RedDecoRouteCard({
  fee,
  path,
  receive,
  status,
  time,
  title,
}: {
  fee: string
  path: string
  receive: string
  status: string
  time: string
  title: string
}) {
  const details = [
    { label: "Fee", value: fee },
    { label: "Tiempo", value: time },
    { label: "Recibe", value: receive },
  ]

  return (
    <article className="flex min-h-[190px] flex-col justify-between rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-5">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{status}</p>
            <h3 className="mt-2 text-xl font-black leading-tight text-foreground">{title}</h3>
          </div>
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{path}</p>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label} className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{detail.label}</p>
              <p className="mt-1 text-sm font-black leading-snug text-foreground">{detail.value}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
