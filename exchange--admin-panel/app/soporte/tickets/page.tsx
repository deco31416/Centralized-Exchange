import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SoporteTicketsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Tickets de usuario"
      description="Casos de soporte, prioridad, responsable y seguimiento."
      state="pending"
      percent={15}
      scopes={[
        { title: "Casos", description: "Solicitud, categoría, usuario y estado." },
        { title: "SLA", description: "Prioridad, tiempos de respuesta y escalamiento." },
        { title: "Trazabilidad", description: "Notas, adjuntos y decisiones del equipo." },
      ]}
    />
  )
}
