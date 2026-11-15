"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AlertasPage() {
  return (
    <AdminModulePlaceholderPage
      title="Alertas del sistema"
      description="Centro de alertas operativas para servicios, seguridad, wallets, integraciones y transacciones."
      state="pending"
      percent={10}
      note="Pendiente conectar el bus de eventos, reglas de alerta y canales de notificación por gateway admin."
      scopes={[
        {
          title: "Severidad",
          description: "Alertas informativas, advertencias, críticas y atendidas.",
        },
        {
          title: "Canales",
          description: "Email, SMS, push, webhooks y notificaciones internas.",
        },
        {
          title: "Reglas",
          description: "Umbrales, condiciones, escalamiento y auditoría.",
        },
      ]}
    />
  )
}
