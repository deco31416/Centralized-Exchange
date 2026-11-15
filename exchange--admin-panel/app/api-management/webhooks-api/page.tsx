"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function WebhooksApiPage() {
  return (
    <AdminModulePlaceholderPage
      title="Webhooks management"
      description="Administración de webhooks para eventos API, firmas, reintentos, entregas y suscripciones."
      state="pending"
      percent={10}
      note="Pendiente conectar servicio de webhooks y entregas reales por gateway admin."
      scopes={[
        { title: "Suscripciones", description: "Eventos, endpoints, secretos y estado." },
        { title: "Entrega", description: "Reintentos, errores, latencia y trazabilidad." },
        { title: "Seguridad", description: "Firma, rotación de secretos y auditoría." },
      ]}
    />
  )
}
