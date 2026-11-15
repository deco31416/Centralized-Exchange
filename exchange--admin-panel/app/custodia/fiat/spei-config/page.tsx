import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatSpeiConfigPage() {
  return (
    <AdminModulePlaceholderPage
      title="Configuración SPEI - STP"
      description="Conexión y reglas de operación para transferencias SPEI/STP."
      state="pending"
      percent={15}
      scopes={[
        { title: "Credenciales", description: "Ambientes, llaves y permisos del proveedor." },
        { title: "Cuentas", description: "Cuentas concentradoras y CLABE operativas." },
        { title: "Conciliación", description: "Confirmaciones, reversos y reportes." },
      ]}
    />
  )
}
