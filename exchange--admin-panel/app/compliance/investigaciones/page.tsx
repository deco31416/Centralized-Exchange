"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function InvestigacionesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Investigaciones"
      description="Casos de cumplimiento, actividad sospechosa y revisión manual de usuarios u operaciones."
      state="pending"
      percent={10}
      note="Pendiente conectar el motor de riesgo, alertas AML y bitácoras de investigación por gateway admin."
      scopes={[
        {
          title: "Casos",
          description: "Bandeja de casos abiertos, en revisión y cerrados.",
        },
        {
          title: "Analistas",
          description: "Asignación de analistas, prioridad y evidencias.",
        },
        {
          title: "Auditoría",
          description: "Historial de decisiones, comentarios y escalamiento.",
        },
      ]}
    />
  )
}
