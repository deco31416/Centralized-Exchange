import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AnalisisUsuariosPage() {
  return (
    <AdminModulePlaceholderPage
      title="Análisis de usuarios"
      description="Segmentación, actividad, retención y comportamiento de usuarios."
      state="pending"
      percent={10}
      scopes={[
        { title: "Segmentos", description: "País, KYC, riesgo, producto y moneda." },
        { title: "Retención", description: "Cohortes, recurrencia y abandono." },
        { title: "Comportamiento", description: "Rutas, eventos y uso de funcionalidades." },
      ]}
    />
  )
}
