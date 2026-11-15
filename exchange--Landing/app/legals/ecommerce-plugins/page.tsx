"use client"

import { Code2, Cookie, FileCheck2, LockKeyhole, ShieldCheck, Store } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function EcommercePluginsLegalPage() {
  return (
    <DecoReferencePage
      eyebrow="Plugins y widgets"
      title="Política de E-Commerce plugins"
      breadcrumb="E-Commerce plugins"
      description="Reglas informativas para widgets, plugins, SDKs, sandbox y experiencias embebidas de Deco Exchange en comercios."
      chartLabel="Integración"
      chartValue="Sandbox"
      chartDelta="Revisión técnica antes de producción"
      calculatorTitle="Activación controlada"
      calculatorDescription="Cada comercio debe validar dominio, KYB, seguridad, cookies, privacidad y webhooks."
      statsTitle="Requisitos técnicos"
      stats={[
        { label: "HTTPS", value: "Requerido", detail: "Sitios seguros" },
        { label: "Sandbox", value: "Previo", detail: "Antes de producción" },
        { label: "Webhooks", value: "Firmados", detail: "Eventos verificables" },
      ]}
      itemsTitle="Condiciones de integración"
      items={[
        { title: "Dominio válido", description: "El comercio debe declarar sitio, actividad y responsables.", Icon: Store },
        { title: "Credenciales", description: "API keys y secretos deben manejarse desde backend seguro.", Icon: LockKeyhole },
        { title: "Eventos", description: "Webhooks y callbacks deben validarse con firma y registros.", Icon: Code2 },
        { title: "Cookies", description: "Widgets pueden requerir aviso de cookies y consentimiento.", Icon: Cookie },
        { title: "Auditoría", description: "Los logs deben permitir trazabilidad de órdenes y errores.", Icon: FileCheck2 },
        { title: "Suspensión", description: "Deco puede suspender integraciones por fraude, riesgo o abuso.", Icon: ShieldCheck },
      ]}
      trends={[
        { label: "Widget", value: "Embebible", detail: "UI" },
        { label: "Plugin", value: "Tienda", detail: "Commerce" },
        { label: "SDK", value: "API", detail: "Dev" },
        { label: "Sandbox", value: "Prueba", detail: "QA" },
      ]}
      noteTitle="Aviso de integración"
      note="Los plugins y widgets de Deco Exchange son experiencias sujetas a aprobación técnica y comercial. La activación real depende de KYB, seguridad, dominio, país, contrato, proveedores, privacidad, cookies y cumplimiento aplicable."
      ctaHref="/business/ecommerce-plugins"
      ctaLabel="Ver página comercial"
    />
  )
}
