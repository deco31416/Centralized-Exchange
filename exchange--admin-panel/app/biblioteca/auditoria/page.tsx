"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AuditoriaPage() {
  return (
    <AdminModulePlaceholderPage
      title="Auditoría"
      description="Centro de logs, seguridad, integridad de balances, flujos crypto, flujos fiat y eventos críticos."
      state="pending"
      percent={10}
      note="Pendiente agregar eventos reales desde microservicios de auditoría por gateway admin."
      scopes={[
        {
          title: "Logs",
          description: "Sistema, seguridad, configuración y eventos críticos.",
        },
        {
          title: "Integridad",
          description: "Balances, ledger, conciliación y verificaciones.",
        },
        {
          title: "Flujos",
          description: "Trazabilidad de flujos crypto y fiat.",
        },
      ]}
    />
  )
}
