import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TransactionsPendientesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Transacciones pendientes"
      description="Movimientos en espera de confirmación, revisión o conciliación."
      state="partial"
      percent={40}
      note="La vista Todas ya lee wallet-ledger por Gateway Admin; falta filtro productivo por estado pendiente."
      scopes={[
        { title: "Confirmación", description: "Esperando red, banco o proveedor." },
        { title: "Revisión", description: "Casos retenidos por riesgo o cumplimiento." },
        { title: "Conciliación", description: "Movimientos pendientes de cruce contable." },
      ]}
    />
  )
}
