"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function ReportesRegulatoriosPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reportes regulatorios"
      description="Preparación, control y trazabilidad de reportes regulatorios del ecosistema DECO EXCHANGE."
      state="pending"
      percent={10}
      note="Pendiente conectar plantillas, archivos generados, evidencias y flujo de aprobación por gateway admin."
      scopes={[
        {
          title: "Reportes",
          description: "Reportes por jurisdicción, periodo y producto.",
        },
        {
          title: "Aprobación",
          description: "Archivos, estados de revisión y aprobaciones.",
        },
        {
          title: "Vencimientos",
          description: "Alertas, responsables y notas legales.",
        },
      ]}
    />
  )
}
