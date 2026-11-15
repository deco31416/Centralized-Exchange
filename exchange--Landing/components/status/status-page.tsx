"use client"

import Link from "next/link"
import { BellOff, Check, ChevronRight, CirclePlus, ShieldCheck } from "lucide-react"

import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { cn } from "@/lib/utils"

type ServiceStatus = {
  category?: string
  name: string
  status: "operational" | "maintenance" | "degraded"
  uptime?: string
}

type Incident = {
  description: string
  endedAt: string
  services: string[]
  startedAt: string
  status: "Completado" | "Monitoreando" | "Programado"
  title: string
}

const services: ServiceStatus[] = [
  { name: "Deco Exchange", status: "operational", uptime: "100 % tiempo de actividad" },
  { name: "API", status: "operational" },
  { category: "Mercados", name: "Trading", status: "operational" },
  { category: "Bolsillito", name: "Abono moneda local", status: "operational" },
  { category: "Bolsillito", name: "Retiro moneda local", status: "operational" },
  { category: "Cripto", name: "Abono criptomonedas", status: "operational" },
  { category: "Cripto", name: "Retiro criptomonedas", status: "operational" },
  { category: "Soporte", name: "Centro de ayuda", status: "operational" },
]

const incidents: Incident[] = [
  {
    description:
      "Actualización preventiva de infraestructura, caché y monitoreo para preparar integraciones de gateway y soporte.",
    endedAt: "25 junio 2026 · 08:00",
    services: ["API", "Trading", "Wallet", "Soporte"],
    startedAt: "25 junio 2026 · 00:04",
    status: "Completado",
    title: "Mantenimiento programado",
  },
]

function statusLabel(status: ServiceStatus["status"]) {
  if (status === "operational") return "Operativo"
  if (status === "maintenance") return "Mantenimiento"
  return "Degradado"
}

function statusTone(status: ServiceStatus["status"]) {
  if (status === "operational") return "bg-emerald-400 text-black"
  if (status === "maintenance") return "bg-primary text-primary-foreground"
  return "bg-amber-400 text-black"
}

function StatusHero() {
  const operationalServices = services.filter((service) => service.status === "operational").length

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none md:p-8">
      <div className="grid min-h-[360px] gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Estado global
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Status Deco</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-none tracking-normal text-foreground md:text-7xl">
            Sistemas operativos
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
            Monitoreo público de servicios, APIs, wallet, mercados, depósitos, retiros y soporte de Deco Exchange.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/legals/help-center"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Contactar soporte
            </Link>
            <Link
              href="/legals/reports"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-bold text-foreground transition-colors hover:border-primary"
            >
              Ver reportes
            </Link>
          </div>
        </div>

        <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Estado actual</p>
              <h2 className="mt-3 text-3xl font-black text-foreground">Todo en línea</h2>
              <p className="mt-2 text-sm text-muted-foreground">Última revisión visual: hace unos minutos.</p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[5px] border-emerald-400 text-emerald-400">
              <Check className="h-8 w-8" strokeWidth={4} />
            </div>
          </div>

          <div className="mt-7 grid gap-3">
            {[
              ["Servicios", `${operationalServices}/${services.length}`, "Operativos"],
              ["Incidentes", "0", "Activos"],
              ["Ventana", "30 días", "Referencial"],
            ].map(([label, value, detail]) => (
              <div key={label} className="flex items-center justify-between rounded-[calc(var(--radius)-0.7rem)] border border-border bg-card px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-black text-foreground">{value}</p>
                </div>
                <span className="text-sm font-bold text-muted-foreground">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ServiceStatusCard({ service }: { service: ServiceStatus }) {
  const operational = service.status === "operational"

  return (
    <article className="flex min-h-[72px] items-center gap-4 rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card px-5 py-4">
      <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground sm:flex">
        <CirclePlus className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-black text-foreground">{service.name}</h3>
          {service.uptime ? (
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-400">
              {service.uptime}
            </span>
          ) : null}
        </div>
        {service.category ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{service.category}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full", statusTone(service.status))}>
          <Check className="h-4 w-4" strokeWidth={4} />
        </span>
        <BellOff className={cn("h-5 w-5", operational ? "text-muted-foreground/70" : "text-primary")} />
      </div>
    </article>
  )
}

function ServicesGrid() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Estado actual</p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-foreground md:text-5xl">Servicios Deco</h2>
        </div>
        <p className="text-sm text-muted-foreground">Tiempo de actividad referencial de los últimos 30 días</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <ServiceStatusCard key={service.name} service={service} />
        ))}
      </div>
    </section>
  )
}

function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <article className="max-w-xl rounded-[var(--radius)] border border-primary bg-card p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none">
      <div className="mb-5 h-1 w-10 rounded-full bg-primary" />
      <p className="text-sm text-muted-foreground">{incident.status}</p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">
        Terminado: {incident.endedAt}
      </p>
      <h3 className="mt-5 text-2xl font-black text-foreground">{incident.title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-foreground">{incident.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {incident.services.map((service) => (
          <span key={service} className="rounded-[calc(var(--radius)-0.75rem)] border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
            {service}
          </span>
        ))}
      </div>
      <Link href="/legals/reports" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
        Ver aviso
        <ChevronRight className="h-4 w-4" />
      </Link>
    </article>
  )
}

function IncidentsSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
      <div>
        <h2 className="text-3xl font-black text-foreground">Resuelto recientemente</h2>
        <div className="mt-8">
          {incidents.map((incident) => (
            <IncidentCard key={incident.title} incident={incident} />
          ))}
        </div>
      </div>
      <aside className="rounded-[var(--radius)] border border-border bg-card p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-xl font-black text-foreground">Avisos anteriores</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Último incidente registrado: 25 junio 2026 · 08:00. Los reportes formales viven en el canal legal de informes.
        </p>
      </aside>
    </section>
  )
}

export function StatusPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container space-y-12 pb-16 pt-28 md:pt-32">
        <StatusHero />
        <ServicesGrid />
        <IncidentsSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
