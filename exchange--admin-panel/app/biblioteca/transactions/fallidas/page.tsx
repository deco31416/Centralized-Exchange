import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TransactionsFallidasPage() {
  return (
    <AdminModulePlaceholderPage
      title="Transacciones fallidas"
      description="Operaciones rechazadas, revertidas o sin ejecución final."
      state="pending"
      percent={25}
      scopes={[
        { title: "Causa", description: "Error de proveedor, red, saldo o validación." },
        { title: "Reintentos", description: "Control de reenvío y reversos seguros." },
        { title: "Soporte", description: "Vinculación con tickets y trazabilidad de usuario." },
      ]}
    />
  )
}
