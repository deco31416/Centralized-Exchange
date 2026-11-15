"use client"

import { Code2, CreditCard, MonitorCog, PackageCheck, ShieldCheck, Store } from "lucide-react"

import {
  CompanyCard,
  CompanyHero,
  CompanyPageShell,
  CompanySection,
  type CompanyCardItem,
} from "@/components/company/shared/company-shell"

const pluginMetrics = [
  { label: "Canal", value: "E-Commerce", detail: "Plugins, widgets y checkout" },
  { label: "Sandbox", value: "Dev", detail: "Pruebas antes de producción" },
  { label: "Soporte", value: "API", detail: "Tickets, logs y trazabilidad" },
]

const pluginCards: CompanyCardItem[] = [
  {
    eyebrow: "Plugin",
    title: "WooCommerce",
    description: "Checkout para tiendas WordPress con órdenes, estados, callback y comprobante.",
    meta: "Planeado",
    Icon: Store,
  },
  {
    eyebrow: "Plugin",
    title: "Shopify",
    description: "Integración comercial para pagos, método Deco y conciliación de órdenes.",
    meta: "Planeado",
    Icon: CreditCard,
  },
  {
    eyebrow: "Widget",
    title: "Checkout embebido",
    description: "Componente web para seleccionar moneda, red, monto, método y estado del pago.",
    meta: "Diseño inicial",
    Icon: MonitorCog,
  },
  {
    eyebrow: "SDK",
    title: "Integración directa",
    description: "APIs y helpers para comercios que prefieren integrar desde su propio backend.",
    meta: "Developers",
    Icon: Code2,
  },
]

const setupSteps: CompanyCardItem[] = [
  {
    eyebrow: "01",
    title: "Solicitar acceso",
    description: "El comercio declara país, actividad, volumen esperado, sitio web y responsables.",
    Icon: PackageCheck,
  },
  {
    eyebrow: "02",
    title: "Validar comercio",
    description: "Deco revisa KYB, riesgo, restricciones, categoría del negocio y permisos aplicables.",
    Icon: ShieldCheck,
  },
  {
    eyebrow: "03",
    title: "Probar sandbox",
    description: "El integrador valida eventos, webhooks, estados, errores y reportes antes de producción.",
    Icon: Code2,
  },
]

export function EcommercePluginsPage() {
  return (
    <CompanyPageShell>
      <CompanyHero
        eyebrow="Empresas · Integraciones"
        title="E-Commerce plugins"
        description="Una página comercial para plugins, widgets y SDKs de pago Deco. Legal queda separado: aquí el comercio entiende qué puede integrar y cómo se prepara."
        metrics={pluginMetrics}
        actions={[
          { href: "/legals/ecommerce-plugins", label: "Ver políticas" },
          { href: "/developers/data-api", label: "Ver Data API", variant: "secondary" },
        ]}
      />

      <CompanySection
        eyebrow="Piezas"
        title="Plugins y widgets"
        description="Cada integración debe poder operar con estados claros, logs, privacidad, límites y soporte trazable."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pluginCards.map((item) => (
            <CompanyCard key={item.title} {...item} />
          ))}
        </div>
      </CompanySection>

      <CompanySection eyebrow="Activación" title="Antes de producción">
        <div className="grid gap-4 md:grid-cols-3">
          {setupSteps.map((item) => (
            <CompanyCard key={item.title} {...item} />
          ))}
        </div>
      </CompanySection>
    </CompanyPageShell>
  )
}
