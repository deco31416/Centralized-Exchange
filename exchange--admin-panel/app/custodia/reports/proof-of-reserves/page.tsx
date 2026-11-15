import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CustodyProofOfReservesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Prueba de reservas"
      description="Evidencia de reservas, pasivos y disponibilidad por activo."
      state="pending"
      percent={20}
      scopes={[
        { title: "Reservas", description: "Fondos verificables por activo y red." },
        { title: "Pasivos", description: "Obligaciones agregadas con usuarios." },
        { title: "Publicación", description: "Reporte preparado para auditoría externa." },
      ]}
    />
  )
}
