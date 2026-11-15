"use client"

import { useState, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Autoplay from "embla-carousel-autoplay"

const partners = [
  {
    name: "alter|alma",
    href: "https://alma.alterhedge.com/",
    type: "Inteligencia operativa",
    description: "Herramientas para analizar, validar y seguir decisiones del ecosistema.",
  },
  {
    name: "Cambia Cripto",
    href: "https://cambia-cripto-dashboard-rosy.vercel.app/dashboard",
    type: "Dashboard cripto",
    description: "Panel para monitorear operaciones, flujos y actividad cripto.",
  },
  {
    name: "BlackCEX",
    href: "https://black-cex.vercel.app/",
    type: "Exchange",
    description: "Experiencia de intercambio digital orientada a pruebas y validación.",
  },
  {
    name: "DECOToken",
    href: "/legals/deco-token",
    type: "Token",
    description: "Activo digital del ecosistema DECO para utilidad, comunidad y herramientas Web3.",
  },
  {
    name: "DECO Exchange",
    href: "https://exchange.deco31416.com/",
    type: "Exchange",
    description: "Plataforma central del ecosistema para intercambio, pagos y operación digital.",
  },
  {
    name: "AlterHedge",
    href: "https://www.alterhedge.com/",
    type: "Fintech research",
    description: "Laboratorio de análisis, estrategia y tecnología para productos financieros.",
  },
  {
    name: "DECO31416",
    href: "https://www.deco31416.com/",
    type: "Builder studio",
    description: "Estudio creador del ecosistema, productos digitales y soluciones Web3.",
  },
]

export default function PartnersSection() {
  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const plugin = Autoplay({ delay: 3000, stopOnInteraction: true })

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container">
        <div className="flex flex-col items-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center">Builds by Deco31416</h2>
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl">
            Productos y laboratorios creados para validar ideas reales, conectar usuarios y acelerar soluciones del ecosistema.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Carousel
            setApi={setApi}
            plugins={[plugin]}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {partners.map((partner, index) => (
                <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/3">
                  <div className="p-4 md:p-6">
                    <Card className="h-full border border-border bg-card shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-[0_24px_58px_rgba(15,23,42,0.12)] dark:hover:border-white/25 dark:shadow-none">
                      <a
                        href={partner.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[230px] flex-col items-center justify-between gap-6 p-6 text-center md:p-8"
                        aria-label={`Abrir ${partner.name}`}
                      >
                        <Badge variant="outline" className="text-sm">
                          {partner.type}
                        </Badge>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-foreground">{partner.name}</h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
                        </div>
                        <span className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 group-hover:scale-[1.02]">
                          Visitar
                        </span>
                      </a>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex flex-col items-center gap-4 mt-6 md:mt-8">
              <div className="flex gap-4">
                <CarouselPrevious className="relative static transform-none" />
                <CarouselNext className="relative static transform-none" />
              </div>

              {/* Pagination indicators */}
              <div className="flex gap-2 mt-4">
                {Array.from({ length: count }).map((_, i) => (
                  <button
                    key={i}
                    className={`h-2 rounded-full transition-all ${current === i + 1 ? "w-6 bg-primary" : "w-2 bg-primary/30"
                      }`}
                    onClick={() => api?.scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
