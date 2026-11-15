import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AuditoriaEventosPage() {
  return (
    <AdminModulePlaceholderPage
      title="Eventos críticos"
      description="Eventos que requieren revisión operativa, seguridad o cumplimiento."
      state="pending"
      percent={20}
      scopes={[
        { title: "Severidad", description: "Clasificación por impacto y urgencia." },
        { title: "Investigación", description: "Estado del análisis y responsable asignado." },
        { title: "Cierre", description: "Resolución, evidencia y acciones tomadas." },
      ]}
    />
  )
}
