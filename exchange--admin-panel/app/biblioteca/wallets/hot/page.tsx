import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function WalletsHotPage() {
  return (
    <AdminModulePlaceholderPage
      title="Hot wallets"
      description="Monitoreo de wallets calientes, liquidez operativa y alertas."
      state="pending"
      percent={20}
      scopes={[
        { title: "Disponibilidad", description: "Fondos disponibles para retiros y operaciones." },
        { title: "Alertas", description: "Umbrales de saldo, red y riesgo operacional." },
        { title: "Barridos", description: "Movimientos hacia almacenamiento frío." },
      ]}
    />
  )
}
