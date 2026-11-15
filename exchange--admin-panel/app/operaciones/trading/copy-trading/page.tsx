import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CopyTradingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Copy trading"
      description="Seguimiento de estrategias y perfiles de traders."
      state="pending"
      percent={5}
      note="I+D+i. Pendiente de modelo de riesgo, permisos y protección al usuario."
      scopes={[
        { title: "Estrategias", description: "Rendimiento, drawdown y exposición." },
        { title: "Seguidores", description: "Asignación, límites y consentimiento." },
        { title: "Riesgo", description: "Alertas, cortes y control de pérdidas." },
      ]}
    />
  )
}
