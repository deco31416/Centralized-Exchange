import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatStripePage() {
  return (
    <AdminModulePlaceholderPage
      title="Stripe"
      description="Operación y conciliación de pagos procesados por Stripe."
      state="pending"
      percent={15}
      scopes={[
        { title: "Pagos", description: "Intentos, confirmaciones y rechazos." },
        { title: "Riesgo", description: "Disputas, chargebacks y controles antifraude." },
        { title: "Conciliación", description: "Eventos Stripe contra ledger interno." },
      ]}
    />
  )
}
