import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatPaypalPage() {
  return (
    <AdminModulePlaceholderPage
      title="PayPal"
      description="Operación de pagos, retiros y conciliación con PayPal."
      state="pending"
      percent={15}
      scopes={[
        { title: "Pagos", description: "Entradas confirmadas y pendientes." },
        { title: "Retiros", description: "Salidas y estados del proveedor." },
        { title: "Disputas", description: "Casos abiertos, evidencia y resolución." },
      ]}
    />
  )
}
