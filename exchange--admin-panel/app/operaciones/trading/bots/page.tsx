import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function BotsTradingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Bots"
      description="Automatizaciones de trading y operación algorítmica."
      state="pending"
      percent={5}
      note="I+D+i. Pendiente de sandbox, permisos y monitoreo antes de activar."
      scopes={[
        { title: "Estrategias", description: "Parámetros, riesgo y capital asignado." },
        { title: "Ejecución", description: "Órdenes, pausas y controles de emergencia." },
        { title: "Monitoreo", description: "Alertas, desempeño y auditoría." },
      ]}
    />
  )
}
