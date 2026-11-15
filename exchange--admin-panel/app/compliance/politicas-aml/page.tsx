"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function PoliticasAMLPage() {
  return (
    <AdminModulePlaceholderPage
      title="Políticas AML/CTF"
      description="Control de políticas internas contra lavado de activos y financiación del terrorismo."
      state="pending"
      percent={10}
      note="Pendiente conectar versiones aprobadas, reglas activas, listas y matriz de control por gateway admin."
      scopes={[
        {
          title: "Versiones",
          description: "Políticas, revisiones y aprobaciones internas.",
        },
        {
          title: "Reglas",
          description: "Reglas AML/CTF activas por producto y jurisdicción.",
        },
        {
          title: "Evidencias",
          description: "Capacitación, auditoría y responsables.",
        },
      ]}
    />
  )
}
