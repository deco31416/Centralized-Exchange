import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CryptoColdStoragePage() {
  return (
    <AdminModulePlaceholderPage
      title="Almacenamiento frío"
      description="Reservas cripto bajo custodia fría, controles y evidencia."
      state="pending"
      percent={15}
      scopes={[
        { title: "Reservas", description: "Fondos en custodia fría por activo y red." },
        { title: "Autorización", description: "Flujos de aprobación y operación segura." },
        { title: "Prueba", description: "Base para reportes de reservas y auditoría." },
      ]}
    />
  )
}
