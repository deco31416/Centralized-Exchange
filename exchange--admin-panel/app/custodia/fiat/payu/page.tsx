import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatPayuPage() {
  return (
    <AdminModulePlaceholderPage
      title="PayU"
      description="Pagos, recaudos y conciliación con PayU."
      state="pending"
      percent={15}
      scopes={[
        { title: "Transacciones", description: "Cobros, rechazos y confirmaciones." },
        { title: "Medios", description: "Tarjeta, banco y métodos locales." },
        { title: "Reportes", description: "Cruce de liquidaciones y ledger." },
      ]}
    />
  )
}
