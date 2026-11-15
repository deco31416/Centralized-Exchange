"use client"

import { BadgeCheck, Code2, Landmark, Rocket, ShieldCheck, WalletCards } from "lucide-react"

import {
  CompanyCard,
  CompanyHero,
  CompanyPageShell,
  CompanySection,
  type CompanyCardItem,
} from "@/components/company/shared/company-shell"

const roadmapMetrics = [
  { label: "Fase", value: "MVP", detail: "Frontend y flujos listos para gateway" },
  { label: "Áreas", value: "6", detail: "Crypto, Bolsillito, Mercados, Rendimiento, Ganar y Red" },
  { label: "Control", value: "Legal", detail: "Disponibilidad sujeta a regulación" },
]

const productAreas: CompanyCardItem[] = [
  {
    eyebrow: "Nivel 1",
    title: "Crypto fácil",
    description: "Compra, venta, conversión, envío y Spot Lite para usuarios que necesitan operar sin complejidad.",
    meta: "Estado: experiencia frontend avanzada",
    Icon: WalletCards,
  },
  {
    eyebrow: "Nivel 2",
    title: "Bolsillito",
    description: "Saldo fiat, recargas, envíos, retiros, remesas y Red Deco para operaciones regionales.",
    meta: "Estado: mockups de flujo y país",
    Icon: Landmark,
  },
  {
    eyebrow: "Nivel 3",
    title: "Mercados",
    description: "P2P, spot, futuros, órdenes avanzadas, market maker, historial, alertas y análisis.",
    meta: "Estado: interfaz trading en desarrollo visual",
    Icon: Rocket,
  },
  {
    eyebrow: "Nivel 4",
    title: "Rendimiento",
    description: "Staking, boveda programada, reservas, calculadora y actividad con claridad de riesgo.",
    meta: "Estado: vistas separadas por producto",
    Icon: ShieldCheck,
  },
  {
    eyebrow: "Nivel 5",
    title: "Ganar",
    description: "Referidos, puntos, cashback, launchpad, misiones, aprende y gana, sponsor ads y ranking.",
    meta: "Estado: programas comerciales simulados",
    Icon: BadgeCheck,
  },
  {
    eyebrow: "Nivel 6",
    title: "Red y Aliados",
    description: "Aliados, comercios, puntos cercanos, operaciones presenciales, reportes y remesas trazables.",
    meta: "Estado: arquitectura frontend inicial",
    Icon: Code2,
  },
]

const phases: CompanyCardItem[] = [
  {
    eyebrow: "01",
    title: "Diseño de experiencia",
    description: "Definir rutas, componentes, navegación, textos regulatorios y estados públicos sin autenticación.",
    meta: "En progreso",
  },
  {
    eyebrow: "02",
    title: "Conexión gateway",
    description: "Sustituir mocks por endpoints de usuario, precios, wallet, métodos, órdenes, remesas y aliados.",
    meta: "Siguiente etapa",
  },
  {
    eyebrow: "03",
    title: "Seguridad y auditoría",
    description: "Revisar headers, consola, cookies, secretos, validaciones, flujos privados y permisos por sesión.",
    meta: "Preparación continua",
  },
  {
    eyebrow: "04",
    title: "Beta controlada",
    description: "Activar pilotos por país, límites, KYC/KYB, proveedores y contratos operativos aprobados.",
    meta: "Sujeto a aprobación",
  },
]

export function RoadmapPage() {
  return (
    <CompanyPageShell>
      <CompanyHero
        eyebrow="Compañía · Roadmap"
        title="Roadmap Deco"
        description="Una vista clara de lo que estamos construyendo, qué depende de backend, qué requiere regulación y qué llegará por fases al ecosistema Deco Exchange."
        metrics={roadmapMetrics}
        actions={[
          { href: "/legals/roadmap", label: "Ver aviso legal" },
          { href: "/developers", label: "Ver developers", variant: "secondary" },
        ]}
      />

      <CompanySection
        eyebrow="Producto"
        title="Áreas del ecosistema"
        description="El roadmap se organiza por módulos reales del producto. Cada área conserva su propio flujo, sus límites y sus estados de autenticación."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {productAreas.map((area) => (
            <CompanyCard key={area.title} {...area} />
          ))}
        </div>
      </CompanySection>

      <CompanySection
        eyebrow="Fases"
        title="Cómo avanzamos"
        description="Este orden evita confundir experiencia visual con operación real: primero producto claro, luego gateway, seguridad, compliance y beta."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {phases.map((phase) => (
            <CompanyCard key={phase.title} {...phase} />
          ))}
        </div>
      </CompanySection>

      <CompanySection eyebrow="Transparencia" title="Qué no promete el roadmap">
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-muted-foreground shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:shadow-none md:p-8">
          Las fechas, prioridades, proveedores, activos, métodos, países y funcionalidades pueden cambiar por regulación,
          licencias, seguridad, auditoría, disponibilidad de partners o decisiones comerciales. El roadmap es una guía de
          producto, no una oferta financiera ni un compromiso contractual de disponibilidad.
        </div>
      </CompanySection>
    </CompanyPageShell>
  )
}
