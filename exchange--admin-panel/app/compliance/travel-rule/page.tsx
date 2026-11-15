"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TravelRulePage() {
  return (
    <AdminModulePlaceholderPage
      title="Travel Rule"
      description="Revisión de información de originador y beneficiario para transferencias cripto sujetas a cumplimiento."
      state="pending"
      percent={10}
      note="Pendiente conectar reglas Travel Rule, proveedores de verificación y eventos transaccionales por gateway admin."
      scopes={[
        {
          title: "Operaciones",
          description: "Revisión por monto, jurisdicción o riesgo.",
        },
        {
          title: "Contrapartes",
          description: "Datos de originador, beneficiario y contraparte.",
        },
        {
          title: "Auditoría",
          description: "Decisiones, evidencias y responsables.",
        },
      ]}
    />
  )
}
