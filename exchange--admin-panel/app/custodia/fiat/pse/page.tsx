import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatPsePage() {
  return (
    <AdminModulePlaceholderPage
      title="PSE"
      description="Pagos y recaudo bancario por PSE."
      state="pending"
      percent={15}
      scopes={[
        { title: "Banco", description: "Entidad origen y estado de pago." },
        { title: "Usuario", description: "Relación con cuenta, KYC y límites." },
        { title: "Conciliación", description: "Confirmación bancaria contra ledger." },
      ]}
    />
  )
}
