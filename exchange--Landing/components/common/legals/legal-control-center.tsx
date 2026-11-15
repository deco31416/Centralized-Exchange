import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { legalControlItems } from "./legal-landing-data"
import { LegalGridCard } from "./legal-grid-card"

export function LegalControlCenter() {
  const [featured, ...items] = legalControlItems
  const FeaturedIcon = featured.icon

  return (
    <section className="py-12 md:py-16">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ff6c02]">Centro de control</p>
        <h2 className="mt-3 text-3xl font-black tracking-normal text-foreground md:text-5xl">Recursos legales clave</h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Link
          href={featured.href}
          className="group relative min-h-[300px] overflow-hidden rounded-[calc(var(--radius)-0.35rem)] border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.18),rgba(226,232,240,0.38)_28%,transparent_56%),linear-gradient(180deg,#ffffff_0%,hsl(var(--card))_70%)] p-7 shadow-[0_22px_70px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.15)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0.035)_28%,transparent_52%),linear-gradient(180deg,#101010_0%,#050505_70%)] dark:shadow-none dark:hover:border-white/15"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.16))] opacity-70 dark:bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.03))] dark:opacity-100" />
          <div className="relative z-10 flex min-h-[246px] flex-col justify-between">
            <div className="max-w-[520px]">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-border bg-background text-[#ff6c02]">
                <FeaturedIcon className="h-5 w-5" />
              </span>
              <h3 className="text-3xl font-black leading-tight text-foreground">{featured.title}</h3>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">{featured.description}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground transition-transform group-hover:translate-x-1">
              Abrir recurso
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <LegalGridCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
