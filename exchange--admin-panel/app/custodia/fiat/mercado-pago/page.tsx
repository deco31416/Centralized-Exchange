import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatMercadoPagoPage() {
  return (
    <AdminModulePlaceholderPage
      title="Mercado Pago"
      description="Integración de cobros, pagos y conciliación con Mercado Pago."
      state="pending"
      percent={15}
      scopes={[
        { title: "Cobros", description: "Depósitos y pagos recibidos por usuario." },
        { title: "Retiros", description: "Salidas hacia cuentas o wallets del proveedor." },
        { title: "Webhooks", description: "Eventos, confirmaciones y fallos." },
      ]}
    />
  )
}
