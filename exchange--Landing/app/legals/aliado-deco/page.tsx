"use client"

import { BadgeCheck, Banknote, Building2, FileCheck2, Handshake, ShieldCheck } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function AliadoDecoLegalPage() {
  return (
    <DecoReferencePage
      eyebrow="Programa de aliados"
      title="Aliado Deco"
      breadcrumb="Aliado Deco"
      description="Condiciones informativas para personas, comercios, empresas y mesas que quieran operar como aliados verificados."
      chartLabel="Perfil operativo"
      chartValue="KYB/KYC"
      chartDelta="Permisos por nivel, pais y servicio"
      calculatorTitle="Estimacion de comisiones"
      calculatorDescription="Las ganancias dependen de volumen, servicio, corredor, tasa, riesgo y contrato comercial aplicable."
      statsTitle="Requisitos base"
      stats={[
        { label: "Niveles", value: "5", detail: "Persona a mesa profesional" },
        { label: "Reportes", value: "PDF/CSV", detail: "Fiscal y operativo" },
        { label: "Datos", value: "Minimos", detail: "Segun rol y ley" },
      ]}
      itemsTitle="Responsabilidades del aliado"
      items={[
        { title: "Verificacion", description: "El aliado debe completar KYC/KYB antes de operar montos habilitados.", Icon: BadgeCheck },
        { title: "Caja declarada", description: "La liquidez se muestra por rangos, no como caja exacta publica.", Icon: Banknote },
        { title: "Comercio seguro", description: "Direcciones y horarios deben cumplir reglas de seguridad operativa.", Icon: Building2 },
        { title: "Comprobantes", description: "Cada operacion conserva registros para conciliacion y reportes fiscales.", Icon: FileCheck2 },
        { title: "Chat controlado", description: "Documentos sensibles deben solicitarse por formularios seguros.", Icon: ShieldCheck },
        { title: "Contrato", description: "La activacion final depende de revision comercial y cumplimiento.", Icon: Handshake },
      ]}
      trends={[
        { label: "Persona", value: "Bajo limite", detail: "KYC" },
        { label: "Comercio", value: "Local fisico", detail: "KYB" },
        { label: "Empresa", value: "Volumen", detail: "Contrato" },
        { label: "Mesa", value: "Profesional", detail: "Riesgo" },
      ]}
      noteTitle="Aviso Aliado Deco"
      note="Aliado Deco no garantiza activacion automatica ni ingresos. La operacion real queda condicionada a verificacion, contrato, licencias, controles AML, auditoria, disponibilidad por pais y aprobacion de Deco Exchange."
      ctaHref="/earn/aliado-deco"
      ctaLabel="Ver Aliado Deco"
    />
  )
}
