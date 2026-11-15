import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function KpisExchangePage() {
  return (
    <AdminModulePlaceholderPage
      title="KPIs del exchange"
      description="Indicadores ejecutivos para operación, crecimiento, riesgo y salud del negocio."
      state="pending"
      percent={10}
      scopes={[
        { title: "Operación", description: "Disponibilidad, velocidad y estabilidad." },
        { title: "Negocio", description: "Activación, ingresos y uso de productos." },
        { title: "Riesgo", description: "Casos AML, fraude, disputas y exposición." },
      ]}
    />
  )
}
