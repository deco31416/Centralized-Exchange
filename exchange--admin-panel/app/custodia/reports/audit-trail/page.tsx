import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CustodyAuditTrailPage() {
  return (
    <AdminModulePlaceholderPage
      title="Registro de auditoría"
      description="Trazabilidad de eventos, aprobaciones y movimientos de custodia."
      state="pending"
      percent={20}
      scopes={[
        { title: "Eventos", description: "Cambios y operaciones sobre fondos custodiados." },
        { title: "Responsables", description: "Usuarios, roles y aprobaciones." },
        { title: "Evidencia", description: "Soportes para auditoría interna y externa." },
      ]}
    />
  )
}
