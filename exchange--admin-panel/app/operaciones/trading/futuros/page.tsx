import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FuturosTradingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Futuros"
      description="Módulo de derivados marcado como I+D+i antes de operación productiva."
      state="pending"
      percent={5}
      note="I+D+i. No hay operación activa ni datos reales conectados."
      scopes={[
        { title: "Diseño", description: "Contratos, márgenes y liquidación por definir." },
        { title: "Riesgo", description: "Controles de exposición, apalancamiento y límites." },
        { title: "Regulación", description: "Disponibilidad sujeta a licencias y jurisdicción." },
      ]}
    />
  )
}
