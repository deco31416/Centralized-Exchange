import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AuditoriaLogsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Logs de sistema"
      description="Eventos técnicos y operativos emitidos por los servicios del exchange."
      state="pending"
      percent={20}
      scopes={[
        { title: "Servicios", description: "Auth, wallet, custodia, pricing, P2P y gateway." },
        { title: "Niveles", description: "Info, advertencia, error y eventos críticos." },
        { title: "Correlación", description: "Trazabilidad por usuario, solicitud y operación." },
      ]}
    />
  )
}
