import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatReconciliacionPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reconciliación bancaria"
      description="Cruce entre movimientos bancarios, proveedores, pasarelas y ledger interno."
      state="pending"
      percent={20}
      scopes={[
        { title: "Extractos", description: "Movimientos de bancos y proveedores." },
        { title: "Ledger", description: "Asientos internos y saldos derivados." },
        { title: "Diferencias", description: "Alertas, ajustes y revisión manual." },
      ]}
    />
  )
}
