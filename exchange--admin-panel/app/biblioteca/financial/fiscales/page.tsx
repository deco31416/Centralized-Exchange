import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FinancialFiscalesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reportes fiscales"
      description="Vista preparada para reportes fiscales y soportes por jurisdicción."
      state="pending"
      percent={15}
      scopes={[
        { title: "Jurisdicción", description: "Reglas fiscales según país o región del usuario." },
        { title: "Actividad anual", description: "Resumen de movimientos, ganancias y retiros." },
        { title: "Soportes", description: "Documentos y descargas para revisión fiscal." },
      ]}
    />
  )
}
