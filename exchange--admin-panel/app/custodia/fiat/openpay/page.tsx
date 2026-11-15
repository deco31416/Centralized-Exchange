import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatOpenpayPage() {
  return (
    <AdminModulePlaceholderPage
      title="OpenPay"
      description="Integración de pagos, retiros y conciliación con OpenPay."
      state="pending"
      percent={15}
      scopes={[
        { title: "Cobros", description: "Estados, métodos y referencias de pago." },
        { title: "Retiros", description: "Salidas y liquidación al usuario." },
        { title: "Conciliación", description: "Eventos contra movimientos internos." },
      ]}
    />
  )
}
