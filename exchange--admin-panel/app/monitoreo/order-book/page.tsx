import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function OrderBookPage() {
  return (
    <AdminModulePlaceholderPage
      title="Order book monitor"
      description="Libro de órdenes, profundidad, spread y ejecución por par."
      state="pending"
      percent={5}
      note="I+D+i. Pendiente de trading engine y canal de mercado por Gateway Admin."
      scopes={[
        { title: "Bids y asks", description: "Órdenes de compra y venta por par." },
        { title: "Profundidad", description: "Liquidez disponible y spread efectivo." },
        { title: "Alertas", description: "Desbalances, baja liquidez y actividad anómala." },
      ]}
    />
  )
}
