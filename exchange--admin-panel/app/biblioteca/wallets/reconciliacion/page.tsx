import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function WalletsReconciliacionPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reconciliación"
      description="Cruce de saldos entre ledger, custodia, proveedores y bancos."
      state="pending"
      percent={20}
      scopes={[
        { title: "Ledger", description: "Saldos contables y movimientos internos." },
        { title: "Custodia", description: "Fondos reales cripto y fiat por proveedor." },
        { title: "Diferencias", description: "Alertas para investigación y ajuste controlado." },
      ]}
    />
  )
}
