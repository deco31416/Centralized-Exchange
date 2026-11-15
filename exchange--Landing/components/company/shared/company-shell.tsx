"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { cn } from "@/lib/utils"

export type CompanyMetric = {
  label: string
  value: string
  detail: string
}

export type CompanyAction = {
  href: string
  label: string
  variant?: "primary" | "secondary"
}

export type CompanyCardItem = {
  title: string
  description: string
  eyebrow?: string
  meta?: string
  Icon?: LucideIcon
}

export function CompanyPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container space-y-10 pb-16 pt-28 md:pt-32">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export function CompanyHero({
  actions,
  description,
  eyebrow,
  metrics,
  title,
}: {
  actions: CompanyAction[]
  description: string
  eyebrow: string
  metrics: CompanyMetric[]
  title: string
}) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none tracking-normal text-foreground md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-2xl">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-colors",
                  action.variant === "secondary"
                    ? "border border-border bg-background text-foreground hover:border-primary"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{metric.label}</p>
              <p className="mt-2 text-3xl font-black text-foreground">{metric.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CompanySection({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode
  description?: string
  eyebrow: string
  title: string
}) {
  return (
    <section className="space-y-6">
      <div className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black tracking-normal text-foreground md:text-5xl">{title}</h2>
        {description ? <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function CompanyCard({ description, eyebrow, Icon, meta, title }: CompanyCardItem) {
  return (
    <article className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
          <h3 className="mt-2 text-xl font-black text-foreground">{title}</h3>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      {meta ? <p className="mt-5 text-sm font-bold text-foreground">{meta}</p> : null}
    </article>
  )
}
