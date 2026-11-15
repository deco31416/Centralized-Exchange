"use client"

import Link from "next/link"
import { BarChart3, Code2, KeyRound, LockKeyhole, ServerCog, Webhook } from "lucide-react"

import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Button } from "@/components/ui/button"

const developerProducts = [
  {
    title: "Data API",
    href: "/developers/data-api",
    description: "Precios, pares, candles, order book, trades y contratos BFF listos para integracion.",
    metric: "Market data",
    icon: BarChart3,
  },
  {
    title: "API keys",
    href: "/developers/data-api",
    description: "Credenciales, scopes, permisos y rotacion para apps internas o clientes autorizados.",
    metric: "Scopes",
    icon: KeyRound,
  },
  {
    title: "Widgets",
    href: "/legals/widgets",
    description: "Politicas y criterios para integrar componentes web de Deco en terceros.",
    metric: "Web",
    icon: Code2,
  },
  {
    title: "Webhooks",
    href: "/developers/data-api",
    description: "Eventos futuros para alertas, ordenes, pagos y estados relevantes de usuario.",
    metric: "Proximo",
    icon: Webhook,
  },
]

const developerRules = [
  ["Publico", "Docs, endpoints y casos de uso."],
  ["Privado", "Keys, logs, permisos y actividad."],
  ["Legal", "Terminos en API Developer y Widgets."],
]

export function DevelopersPage() {
  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <div className="h-14" />

        <main className="container space-y-6 pb-10 pt-6">
          <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <div className="grid gap-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Developers</p>
                <h1 className="mt-2 text-4xl font-black tracking-normal text-foreground md:text-6xl">
                  Conecta Deco a tu producto
                </h1>
                <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-xl">
                  Integra datos de mercado, widgets, sandbox y permisos con una experiencia tecnica separada de los mercados operativos.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild className="rounded-full">
                    <Link href="/developers/data-api">Explorar Data API</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/legals/api-developer">Ver terminos API</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Estado</p>
                <p className="mt-2 text-3xl font-black text-foreground">Portal tecnico</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Separado de Mercados para que operar, integrar y documentar no se mezclen.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {developerProducts.map((product) => {
              const Icon = product.icon
              return (
                <Link
                  key={product.title}
                  href={product.href}
                  className="group flex min-h-[230px] flex-col justify-between rounded-[var(--radius)] border border-border bg-card/90 p-5 transition-colors hover:bg-muted/45 dark:bg-white/[0.035] dark:hover:bg-white/[0.055]"
                >
                  <span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-4 block text-xl font-black text-foreground">{product.title}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{product.description}</span>
                  </span>
                  <span className="mt-5 text-sm font-black text-foreground">{product.metric}</span>
                </Link>
              )
            })}
          </section>

          <section className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Modelo de acceso</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Publico primero, privado con login</h2>
              <div className="mt-4 space-y-2">
                {developerRules.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-right text-sm font-black text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Seguridad</p>
                  <h2 className="mt-2 text-2xl font-black text-foreground">Credenciales fuera del navegador publico</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Las keys, logs privados, rotacion, scopes de trading y datos de cuenta se conectaran al gateway autenticado.
                    La pagina publica solo explica el producto y muestra contratos referenciales.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["BFF", "Scopes", "Sandbox"].map((item) => (
                  <div key={item} className="rounded-xl border border-border bg-background px-4 py-3">
                    <ServerCog className="h-4 w-4 text-primary" />
                    <p className="mt-3 text-sm font-black text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}
