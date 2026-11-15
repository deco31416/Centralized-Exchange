import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function WalletsColdPage() {
  return (
    <AdminModulePlaceholderPage
      title="Cold wallets"
      description="Custodia fría, reservas y controles de seguridad."
      state="pending"
      percent={15}
      scopes={[
        { title: "Reservas", description: "Fondos bajo almacenamiento frío." },
        { title: "Firmas", description: "Flujos de autorización y evidencia operativa." },
        { title: "Auditoría", description: "Trazabilidad para prueba de reservas." },
      ]}
    />
  )
}
