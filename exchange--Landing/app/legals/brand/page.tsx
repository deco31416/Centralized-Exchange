"use client"

import { BadgeCheck, FileCheck2, LockKeyhole, Megaphone, Palette, ShieldAlert } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function BrandLegalPage() {
  return (
    <DecoReferencePage
      eyebrow="Uso de marca"
      title="Política de Marca"
      breadcrumb="Marca"
      description="Reglas informativas para el uso del nombre, logos, materiales, piezas comerciales y comunicaciones asociadas a Deco Exchange."
      chartLabel="Uso autorizado"
      chartValue="Revisión"
      chartDelta="Permisos por canal y campaña"
      calculatorTitle="Antes de publicar"
      calculatorDescription="Cualquier uso comercial o co-brandeado puede requerir autorización previa."
      statsTitle="Controles de marca"
      stats={[
        { label: "Logo", value: "Oficial", detail: "Sin alteraciones" },
        { label: "Campañas", value: "Revisión", detail: "Antes de publicar" },
        { label: "Fraude", value: "Cero", detail: "No suplantación" },
      ]}
      itemsTitle="Reglas principales"
      items={[
        { title: "Identidad oficial", description: "El logo y nombre no deben alterarse ni usarse para suplantación.", Icon: BadgeCheck },
        { title: "Colores", description: "Los colores deben mantener contraste y legibilidad.", Icon: Palette },
        { title: "Publicidad", description: "No se permiten promesas de rentabilidad o disponibilidad garantizada.", Icon: Megaphone },
        { title: "Co-branding", description: "Aliados y comercios requieren autorización para piezas conjuntas.", Icon: FileCheck2 },
        { title: "Datos", description: "Las piezas no deben exponer datos personales ni financieros.", Icon: LockKeyhole },
        { title: "Reportes", description: "Cualquier uso sospechoso debe reportarse a soporte.", Icon: ShieldAlert },
      ]}
      trends={[
        { label: "Logo", value: "Permitido", detail: "Guía" },
        { label: "Campaña", value: "Revisión", detail: "Legal" },
        { label: "Aliado", value: "Contrato", detail: "KYB" },
        { label: "Fraude", value: "Bloqueo", detail: "Soporte" },
      ]}
      noteTitle="Aviso legal"
      note="El uso de la marca Deco Exchange no implica alianza, licencia, aprobación, disponibilidad de producto ni autorización comercial salvo acuerdo escrito. Deco puede solicitar retiro de piezas que generen confusión, riesgo, fraude o incumplimiento."
      ctaHref="/brand"
      ctaLabel="Ver guía pública"
    />
  )
}
