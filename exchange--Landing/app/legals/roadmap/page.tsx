"use client"

import { BadgeCheck, Code2, FileCheck2, Rocket, ShieldCheck, TimerReset } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function RoadmapLegalPage() {
  return (
    <DecoReferencePage
      eyebrow="Transparencia de producto"
      title="Aviso de Roadmap"
      breadcrumb="Roadmap"
      description="Documento informativo sobre fases, prioridades, dependencias técnicas y condiciones que pueden modificar el roadmap público de Deco Exchange."
      chartLabel="Estado general"
      chartValue="MVP"
      chartDelta="Sujeto a auditoría, licencias y backend"
      calculatorTitle="Lectura del roadmap"
      calculatorDescription="El roadmap organiza intención de producto, no disponibilidad contractual ni promesa de fecha."
      statsTitle="Variables que pueden cambiar"
      stats={[
        { label: "Regulación", value: "País", detail: "Licencias y permisos" },
        { label: "Backend", value: "Gateway", detail: "Endpoints y proveedores" },
        { label: "Seguridad", value: "QA", detail: "Auditoría y riesgo" },
      ]}
      itemsTitle="Condiciones del roadmap"
      items={[
        { title: "Sin promesa de fecha", description: "Las fechas son referencias internas y pueden cambiar.", Icon: TimerReset },
        { title: "Fases revisables", description: "Las prioridades pueden moverse por riesgo o regulación.", Icon: Rocket },
        { title: "Dependencias técnicas", description: "Algunas funciones dependen de APIs, gateway y proveedores.", Icon: Code2 },
        { title: "Control legal", description: "La disponibilidad final requiere revisión regulatoria.", Icon: ShieldCheck },
        { title: "Auditoría", description: "Los módulos críticos requieren pruebas y controles.", Icon: BadgeCheck },
        { title: "Documentación", description: "Cada etapa debe mantener registro y changelog.", Icon: FileCheck2 },
      ]}
      trends={[
        { label: "Frontend", value: "Activo", detail: "MVP" },
        { label: "Gateway", value: "Pendiente", detail: "API" },
        { label: "Licencias", value: "Revisión", detail: "País" },
        { label: "Beta", value: "Futura", detail: "QA" },
      ]}
      noteTitle="Naturaleza informativa"
      note="El roadmap no constituye oferta, garantía de disponibilidad, asesoría financiera ni compromiso contractual. Deco Exchange puede modificar prioridades, países, activos, proveedores, rutas, comisiones, límites o fechas por razones técnicas, comerciales, regulatorias o de seguridad."
      ctaHref="/roadmap"
      ctaLabel="Ver roadmap público"
    />
  )
}
