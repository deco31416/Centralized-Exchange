import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AssetsRedesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Estado de redes"
      description="Monitoreo de blockchains, confirmaciones, fees y sincronización."
      state="pending"
      percent={25}
      scopes={[
        { title: "Sincronización", description: "Altura de bloque y estado de nodos." },
        { title: "Fees", description: "Costos estimados por red y prioridad." },
        { title: "Disponibilidad", description: "Depósitos, retiros y alertas operativas." },
      ]}
    />
  )
}
