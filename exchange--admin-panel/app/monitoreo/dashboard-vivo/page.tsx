import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function DashboardVivoPage() {
  return (
    <AdminModulePlaceholderPage
      title="Dashboard en vivo"
      description="Monitoreo operativo en tiempo real de usuarios, API, servicios y volumen."
      state="pending"
      percent={10}
      note="Pendiente de servicio de streaming por Gateway Admin. No se muestran métricas generadas."
      scopes={[
        { title: "Streaming", description: "Eventos en tiempo real desde gateway y microservicios." },
        { title: "Métricas", description: "Usuarios activos, operaciones, latencia y carga." },
        { title: "Regiones", description: "Actividad por país, región y disponibilidad." },
      ]}
    />
  )
}
