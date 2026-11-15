"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TemplatesEmailPage() {
  return (
    <AdminModulePlaceholderPage
      title="Templates de email"
      description="Plantillas de correo para flujos transaccionales, seguridad, soporte y comunicaciones del exchange."
      state="pending"
      percent={10}
      note="Pendiente conectar repositorio de plantillas, aprobaciones y proveedor de email por gateway admin."
      scopes={[
        {
          title: "Plantillas",
          description: "Versiones, variables y traducciones.",
        },
        {
          title: "Aprobación",
          description: "Revisión legal, marketing y operaciones.",
        },
        {
          title: "Entrega",
          description: "Eventos de envío, rebotes y auditoría.",
        },
      ]}
    />
  )
}
