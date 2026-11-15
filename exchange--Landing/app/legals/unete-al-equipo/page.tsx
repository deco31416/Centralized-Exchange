"use client"

import { BadgeCheck, BriefcaseBusiness, FileCheck2, LockKeyhole, MessageCircle, ShieldAlert } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function CareersLegalPage() {
  return (
    <DecoReferencePage
      eyebrow="Candidatos y colaboradores"
      title="Aviso para unirse al equipo"
      breadcrumb="Únete al equipo"
      description="Condiciones informativas para candidatos, colaboradores, aliados operativos y personas interesadas en trabajar con Deco Exchange."
      chartLabel="Proceso de selección"
      chartValue="0 pagos"
      chartDelta="Deco nunca cobra por aplicar"
      calculatorTitle="Canales oficiales"
      calculatorDescription="Toda postulación debe validarse por canales oficiales, soporte o contacto autorizado."
      statsTitle="Protección del candidato"
      stats={[
        { label: "Pagos", value: "Nunca", detail: "No se cobra por aplicar" },
        { label: "Datos", value: "Mínimos", detail: "Según etapa del proceso" },
        { label: "Canales", value: "Oficiales", detail: "Verificables por soporte" },
      ]}
      itemsTitle="Reglas del proceso"
      items={[
        { title: "Sin pagos", description: "No solicitamos depósitos, compras, cursos ni transferencias.", Icon: ShieldAlert },
        { title: "Datos personales", description: "La información del candidato debe tratarse con privacidad.", Icon: LockKeyhole },
        { title: "Verificación", description: "Los roles pueden requerir validación técnica, legal o comercial.", Icon: BadgeCheck },
        { title: "Contacto", description: "Las comunicaciones deben mantenerse en canales verificables.", Icon: MessageCircle },
        { title: "Acuerdos", description: "Cualquier colaboración requiere condiciones claras por escrito.", Icon: FileCheck2 },
        { title: "Roles", description: "Las vacantes dependen de etapa, país, presupuesto y prioridad.", Icon: BriefcaseBusiness },
      ]}
      trends={[
        { label: "Frontend", value: "Producto", detail: "Área" },
        { label: "Backend", value: "Gateway", detail: "Área" },
        { label: "Compliance", value: "Riesgo", detail: "Área" },
        { label: "Growth", value: "Aliados", detail: "Área" },
      ]}
      noteTitle="Prevención de fraude"
      note="Deco Exchange no solicita claves, frases semilla, depósitos, pagos, inversiones ni compras para aplicar a un rol. Cualquier mensaje sospechoso debe reportarse al centro de ayuda antes de compartir información personal."
      ctaHref="/unete-al-equipo"
      ctaLabel="Ver página del equipo"
    />
  )
}
