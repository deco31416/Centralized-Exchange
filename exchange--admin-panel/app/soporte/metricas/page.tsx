import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SoporteMetricasPage() {
  return (
    <AdminModulePlaceholderPage
      title="Métricas de soporte"
      description="SLA, tiempos de atención, carga de equipo y satisfacción."
      state="pending"
      percent={10}
      note="Depende de tickets y chat conectados. No se muestran métricas estimadas."
      scopes={[
        { title: "SLA", description: "Primera respuesta, resolución y escalamiento." },
        { title: "Equipo", description: "Carga por agente, cola y productividad." },
        { title: "Calidad", description: "Satisfacción, reincidencia y casos reabiertos." },
      ]}
    />
  )
}
