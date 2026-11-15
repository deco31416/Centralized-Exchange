"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Repeat2, Send, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const featuredProducts = [
  {
    title: "Mercado P2P ahora disponible",
    badge: "TENDENCIA",
    description:
      "Compra y vende activos directamente entre usuarios con herramientas simples, seguras y preparadas para operar.",
    href: "/markets/p2p",
    cta: "Ir a Comercio P2P",
    Icon: Repeat2,
  },
  {
    title: "Remesas para mover valor",
    badge: "TENDENCIA",
    description:
      "Mueve tu dinero entre países con una experiencia clara, rápida y pensada para conectar usuarios, comercios y familias.",
    href: "/bolsillito/remittances",
    cta: "Explorar remesas",
    Icon: Send,
  },
  {
    title: "Gana con tus activos",
    badge: "RENDIMIENTO",
    description:
      "Accede a herramientas de staking y rendimiento con información simple para gestionar tus activos de forma responsable.",
    href: "/staking/tokens",
    cta: "Ver rendimientos",
    Icon: TrendingUp,
  },
]

export default function SpotTradingBanner() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredProducts.length)
    }, 4600)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section id="destacados" className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-none">
          <div className="relative h-[310px] sm:h-[280px] md:h-[220px]">
            <div
              className="h-full transition-transform duration-700"
              style={{
                transform: `translateY(-${activeIndex * 100}%)`,
                transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {featuredProducts.map(({ title, badge, description, href, cta, Icon }) => (
                <article
                  key={title}
                  className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8 md:flex-row md:items-center md:p-10"
                >
                  <div className="max-w-3xl space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold tracking-wide text-background dark:bg-white dark:text-black">
                        <Icon className="h-3.5 w-3.5" />
                        {badge}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-normal text-foreground md:text-4xl lg:text-5xl">
                        {title}
                      </h2>
                      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        {description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-5 md:items-end">
                    <Button
                      asChild
                      size="lg"
                      className="h-12 rounded-full bg-[#ff6c02] px-7 text-base font-semibold text-white hover:bg-[#ff6c02]/90"
                    >
                      <Link href={href}>
                        {cta}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                      {featuredProducts.map((item, index) => (
                        <button
                          key={item.title}
                          type="button"
                          aria-label={`Ver ${item.title}`}
                          onClick={() => setActiveIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === activeIndex
                              ? "w-8 bg-[#ff6c02]"
                              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
