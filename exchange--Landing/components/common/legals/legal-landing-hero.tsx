import Image from "next/image"
import { ShieldCheck } from "lucide-react"

import { legalJurisdictions } from "./legal-landing-data"

export function LegalLandingHero() {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.20),rgba(226,232,240,0.45)_28%,transparent_56%),linear-gradient(180deg,#ffffff_0%,hsl(var(--background))_68%)] px-5 py-16 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.13),rgba(255,255,255,0.04)_28%,transparent_52%),linear-gradient(180deg,#050505_0%,#000000_68%)] dark:shadow-none sm:px-8 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.18))] opacity-70 dark:bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.03))] dark:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.085)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.085)_1px,transparent_1px)] bg-[size:92px_92px] opacity-65 [mask-image:linear-gradient(to_bottom,black_0%,black_76%,transparent_100%)] dark:bg-[linear-gradient(rgba(255,255,255,0.085)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.085)_1px,transparent_1px)] dark:opacity-55" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_360px] lg:items-center">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ff6c02]">Información Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
            DECO EXCHANGE
          </h1>
          <p className="mt-4 max-w-xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
            Consulta documentos legales, políticas operativas y avisos regulatorios del ecosistema DECO EXCHANGE. La información es referencial.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm ring-1 ring-foreground/10 dark:border-white dark:bg-white dark:text-black dark:ring-white/10">
            <ShieldCheck className="h-4 w-4 text-[#ff6c02]" />
            Sin licencia operativa
          </div>
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-[320px] place-items-center">
          <div className="absolute inset-8 rounded-full bg-slate-400/10 blur-3xl dark:bg-white/10" />
          <Image
            src="/images/deco-gif/coin-deco.gif"
            alt="DECOToken"
            width={320}
            height={320}
            className="relative z-10 h-auto w-full object-contain"
            unoptimized
            priority
          />
        </div>
      </div>

      <div className="relative z-10 mt-12 grid divide-y divide-border border-t border-border md:grid-cols-4 md:divide-x md:divide-y-0">
        {legalJurisdictions.map((item) => (
          <div key={item.country} className="px-4 py-5 text-center">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-foreground">{item.country}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
