import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function ReportesPersonalizadosPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reportes personalizados"
      description="Reportes configurables para operación, cumplimiento y dirección."
      state="pending"
      percent={10}
      scopes={[
        { title: "Constructor", description: "Campos, filtros, periodo y formato." },
        { title: "Programación", description: "Envío recurrente y permisos por rol." },
        { title: "Exportación", description: "CSV, PDF y descarga segura." },
      ]}
    />
  )
}
