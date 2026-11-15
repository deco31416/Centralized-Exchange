"use client"

import Link from "next/link"
import { BadgeCheck, BriefcaseBusiness, Code2, FileCheck2, HeartHandshake, ShieldCheck } from "lucide-react"

import {
  CompanyCard,
  CompanyHero,
  CompanyPageShell,
  CompanySection,
  type CompanyCardItem,
} from "@/components/company/shared/company-shell"

const careersMetrics = [
  { label: "Modelo", value: "Remoto", detail: "Colaboración por producto y país" },
  { label: "Áreas", value: "7", detail: "Producto, tech, compliance y crecimiento" },
  { label: "Fraude", value: "0 pagos", detail: "Deco nunca cobra por aplicar" },
]

const cultureItems: CompanyCardItem[] = [
  {
    eyebrow: "Producto",
    title: "Construir con criterio",
    description: "Diseñamos flujos financieros complejos con claridad visual, estados reales y responsabilidad regulatoria.",
    Icon: BriefcaseBusiness,
  },
  {
    eyebrow: "Seguridad",
    title: "Pensar antes de activar",
    description: "Cada operación debe contemplar privacidad, riesgo, trazabilidad, límites y protección del usuario.",
    Icon: ShieldCheck,
  },
  {
    eyebrow: "Equipo",
    title: "Trabajo modular",
    description: "Preferimos componentes, contratos claros y decisiones documentadas para crecer sin perder control.",
    Icon: Code2,
  },
]

const roles: CompanyCardItem[] = [
  {
    eyebrow: "Frontend",
    title: "Producto y experiencia",
    description: "Interfaces dashboard-landing, trading, wallet, remesas, soporte, onboarding y visual QA.",
    meta: "React, Next.js, UI systems",
    Icon: Code2,
  },
  {
    eyebrow: "Backend",
    title: "Gateway y servicios",
    description: "APIs de usuario, wallet, precios, órdenes, remesas, aliados, reportes y compliance.",
    meta: "APIs, seguridad, eventos",
    Icon: FileCheck2,
  },
  {
    eyebrow: "Compliance",
    title: "Riesgo y regulación",
    description: "KYC/KYB, AML, políticas, reservas, auditoría, trazabilidad, límites y reportes por país.",
    meta: "Legal, riesgo, operaciones",
    Icon: BadgeCheck,
  },
  {
    eyebrow: "Growth",
    title: "Comunidad y aliados",
    description: "Red Deco, embajadores, sponsor ads, referidos, comercios, puntos físicos y soporte comercial.",
    meta: "LatAm, partners, soporte",
    Icon: HeartHandshake,
  },
]

const openPositions = [
  {
    area: "Frontend",
    location: "Remoto LatAm",
    priority: "Alta",
    title: "Senior Frontend Engineer",
    description: "Construir interfaces dashboard-landing, componentes reutilizables, QA visual y flujos conectables al gateway.",
    stack: "Next.js · React · TypeScript · UI systems",
  },
  {
    area: "Backend",
    location: "Remoto",
    priority: "Alta",
    title: "Backend / Gateway Engineer",
    description: "Diseñar endpoints para wallet, precios, órdenes, remesas, aliados, reportes y eventos seguros.",
    stack: "APIs · Auth · Events · Integraciones",
  },
  {
    area: "Security",
    location: "Remoto",
    priority: "Media",
    title: "Frontend Security Auditor",
    description: "Auditar headers, cookies, consola, exposición de secretos, permisos, rutas privadas y flujos de sesión.",
    stack: "AppSec · Next.js · OWASP · QA",
  },
  {
    area: "Compliance",
    location: "Colombia / LatAm",
    priority: "Media",
    title: "KYC / AML Operations",
    description: "Mapear reglas de riesgo, reportes, límites, verificación, aliados y trazabilidad por país.",
    stack: "KYC · KYB · AML · Riesgo",
  },
  {
    area: "Growth",
    location: "LatAm",
    priority: "Media",
    title: "Aliados y Red Deco Lead",
    description: "Activar comercios, cajeros, puntos aliados, rutas presenciales, remesas y soporte comercial.",
    stack: "Partners · Red Deco · Operaciones",
  },
  {
    area: "Support",
    location: "Remoto",
    priority: "Inicial",
    title: "Soporte P2P y Wallet",
    description: "Atender tickets, clasificar casos, guiar usuarios, escalar riesgo y documentar incidencias de producto.",
    stack: "Zendesk-like · P2P · Wallet · Riesgo",
  },
]

const applicationSteps: CompanyCardItem[] = [
  {
    eyebrow: "01",
    title: "Contacto inicial",
    description: "El candidato comparte área, experiencia, país y disponibilidad por canales oficiales.",
  },
  {
    eyebrow: "02",
    title: "Revisión del equipo",
    description: "Deco revisa ajuste técnico, producto, comunicación, seguridad y sensibilidad regulatoria.",
  },
  {
    eyebrow: "03",
    title: "Prueba o conversación",
    description: "La evaluación puede ser técnica, de producto, legal, soporte o comercial según el rol.",
  },
  {
    eyebrow: "04",
    title: "Acuerdo formal",
    description: "Cualquier colaboración requiere condiciones claras, privacidad, alcance y aprobación interna.",
  },
]

export function CareersPage() {
  return (
    <CompanyPageShell>
      <CompanyHero
        eyebrow="Compañía · Equipo"
        title="Únete al equipo"
        description="Buscamos personas que sepan construir producto financiero con calma, criterio senior y respeto por la seguridad del usuario."
        metrics={careersMetrics}
        actions={[
          { href: "/legals/unete-al-equipo", label: "Ver aviso para candidatos" },
          { href: "/legals/contacto", label: "Contactar", variant: "secondary" },
        ]}
      />

      <CompanySection
        eyebrow="Cultura"
        title="Cómo trabajamos"
        description="Deco necesita gente que pueda moverse entre producto, ingeniería, regulación y experiencia de usuario sin perder el norte."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {cultureItems.map((item) => (
            <CompanyCard key={item.title} {...item} />
          ))}
        </div>
      </CompanySection>

      <CompanySection
        eyebrow="Roles"
        title="Áreas donde buscamos talento"
        description="Estas áreas son referenciales. Las vacantes reales dependen de etapa, país, presupuesto, seguridad y prioridad operativa."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => (
            <CompanyCard key={role.title} {...role} />
          ))}
        </div>
      </CompanySection>

      <CompanySection
        eyebrow="Puestos"
        title="Puestos que estamos buscando"
        description="Estos puestos son iniciales y pueden cambiar según prioridad del producto. El foco está en construir con seguridad, documentación y criterio operativo."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {openPositions.map((position) => (
            <article
              key={position.title}
              className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{position.area}</p>
                  <h3 className="mt-2 text-xl font-black text-foreground">{position.title}</h3>
                </div>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
                  {position.priority}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{position.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Modalidad</p>
                  <p className="mt-1 font-black text-foreground">{position.location}</p>
                </div>
                <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Stack / foco</p>
                  <p className="mt-1 font-black text-foreground">{position.stack}</p>
                </div>
              </div>
              <Link
                href="/legals/contacto"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Postularme
              </Link>
            </article>
          ))}
        </div>
      </CompanySection>

      <CompanySection eyebrow="Proceso" title="Flujo de aplicación">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {applicationSteps.map((step) => (
            <CompanyCard key={step.title} {...step} />
          ))}
        </div>
      </CompanySection>

      <CompanySection eyebrow="Seguridad" title="Prevención de fraude laboral">
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-muted-foreground shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none md:p-8">
          Deco Exchange no solicita pagos, claves, frases semilla, depósitos, compras de cursos ni transferencias para
          aplicar a un rol. Cualquier proceso debe ocurrir por canales oficiales y puede ser verificado desde soporte.
        </div>
      </CompanySection>
    </CompanyPageShell>
  )
}
