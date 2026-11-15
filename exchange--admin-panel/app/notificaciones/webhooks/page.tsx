"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function WebhooksPage() {
  return (
    <AdminModulePlaceholderPage
      title="Webhooks"
      description="Eventos salientes para integraciones internas y externas con firma, reintentos y trazabilidad."
      state="pending"
      percent={10}
      note="Pendiente conectar registro de webhooks, firmas y entregas reales por gateway admin."
      scopes={[
        {
          title: "Eventos",
          description: "Catálogo de eventos disponibles y payloads.",
        },
        {
          title: "Seguridad",
          description: "Firmas, secretos, IP allowlist y rotación.",
        },
        {
          title: "Entrega",
          description: "Reintentos, errores, latencia y auditoría.",
        },
      ]}
    />
  )
}
