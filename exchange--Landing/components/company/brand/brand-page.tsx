"use client"

import { BadgeCheck, BookOpen, Download, Palette, ShieldCheck, Sparkles } from "lucide-react"

import {
  CompanyCard,
  CompanyHero,
  CompanyPageShell,
  CompanySection,
  type CompanyCardItem,
} from "@/components/company/shared/company-shell"

const brandMetrics = [
  { label: "Uso", value: "Claro", detail: "Logo, tono y piezas verificables" },
  { label: "Marca", value: "Deco", detail: "Exchange, wallet y ecosistema" },
  { label: "Control", value: "Legal", detail: "Permisos antes de campañas" },
]

const brandRules: CompanyCardItem[] = [
  {
    eyebrow: "Identidad",
    title: "Logo y nombre",
    description: "Usa Deco Exchange, Deco31416 y sus variantes solo en contextos aprobados, sin alterar proporciones ni sentido.",
    Icon: BadgeCheck,
  },
  {
    eyebrow: "Sistema visual",
    title: "Color y contraste",
    description: "Mantén el naranja principal, fondos limpios y contraste suficiente en piezas oscuras o claras.",
    Icon: Palette,
  },
  {
    eyebrow: "Comunicación",
    title: "Tono de voz",
    description: "Directo, confiable y educativo. Evita promesas financieras, rentabilidad garantizada o lenguaje de inversión segura.",
    Icon: BookOpen,
  },
  {
    eyebrow: "Campañas",
    title: "Uso comercial",
    description: "Toda campaña, alianza, patrocinio o material co-brandeado requiere revisión antes de publicarse.",
    Icon: ShieldCheck,
  },
]

const assetItems: CompanyCardItem[] = [
  {
    eyebrow: "01",
    title: "Kit de logo",
    description: "Versiones para claro, oscuro, horizontal, isotipo y uso pequeño.",
    meta: "Pendiente de descarga final",
    Icon: Download,
  },
  {
    eyebrow: "02",
    title: "Plantillas sociales",
    description: "Piezas para anuncios, sponsor ads, referidos, comunidad, launchpad y soporte.",
    meta: "Mock visual",
    Icon: Sparkles,
  },
  {
    eyebrow: "03",
    title: "Guía de co-branding",
    description: "Reglas para aliados, comercios, integradores, market makers y puntos Red Deco.",
    meta: "Revisión legal",
    Icon: BadgeCheck,
  },
]

export function BrandPage() {
  return (
    <CompanyPageShell>
      <CompanyHero
        eyebrow="Compañía · Marca"
        title="Guía de Marca"
        description="Un espacio público para entender cómo usar la identidad de Deco Exchange sin confundir al usuario, prometer servicios no disponibles o afectar la confianza del ecosistema."
        metrics={brandMetrics}
        actions={[
          { href: "/legals/brand", label: "Ver reglas legales" },
          { href: "/legals/contacto", label: "Solicitar uso", variant: "secondary" },
        ]}
      />

      <CompanySection
        eyebrow="Reglas"
        title="Uso responsable de la identidad"
        description="La marca debe ayudar al usuario a reconocer canales oficiales, productos reales y comunicaciones verificables."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {brandRules.map((item) => (
            <CompanyCard key={item.title} {...item} />
          ))}
        </div>
      </CompanySection>

      <CompanySection
        eyebrow="Assets"
        title="Materiales de marca"
        description="Estos recursos se preparan para partners, prensa, embajadores, aliados y campañas comerciales."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {assetItems.map((item) => (
            <CompanyCard key={item.title} {...item} />
          ))}
        </div>
      </CompanySection>
    </CompanyPageShell>
  )
}
