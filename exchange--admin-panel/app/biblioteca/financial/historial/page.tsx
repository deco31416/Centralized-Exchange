import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FinancialHistorialPage() {
  return (
    <AdminModulePlaceholderPage
      title="Historial financiero"
      description="Cronología financiera por usuario, moneda y origen operativo."
      state="pending"
      percent={20}
      scopes={[
        { title: "Eventos de saldo", description: "Cambios de saldo y reservas por operación." },
        { title: "Trazabilidad", description: "Relación entre usuario, ledger y referencia externa." },
        { title: "Exportación", description: "Reportes descargables cuando el endpoint esté disponible." },
      ]}
    />
  )
}
