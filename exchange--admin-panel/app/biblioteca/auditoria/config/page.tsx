import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AuditoriaConfigPage() {
  return (
    <AdminModulePlaceholderPage
      title="Cambios de configuración"
      description="Historial de ajustes operativos, parámetros y políticas."
      state="pending"
      percent={20}
      scopes={[
        { title: "Antes y después", description: "Diferencias de configuración por cambio." },
        { title: "Aprobación", description: "Usuario, rol y evidencia de autorización." },
        { title: "Impacto", description: "Producto, país, activo o servicio afectado." },
      ]}
    />
  )
}
