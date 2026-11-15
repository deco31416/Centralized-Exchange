"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CustodyReportsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reportes de custodia"
      description="Centro de balance, prueba de reservas, activos contra pasivos y auditoría de custodia."
      state="pending"
      percent={10}
      note="Pendiente conectar reportes de custodia reales, snapshots y proof-of-reserves por gateway admin."
      scopes={[
        {
          title: "Balance",
          description: "Hoja de balance consolidada entre activos, pasivos y reservas.",
        },
        {
          title: "Reservas",
          description: "Prueba de reservas, snapshots, validación y evidencia.",
        },
        {
          title: "Auditoría",
          description: "Registro de auditoría, cambios y revisión de integridad.",
        },
      ]}
    />
  )
}
