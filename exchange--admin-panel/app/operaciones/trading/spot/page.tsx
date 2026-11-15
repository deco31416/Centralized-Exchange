import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SpotTradingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Trading spot"
      description="Órdenes spot, ejecuciones, pares y libro de mercado."
      state="pending"
      percent={20}
      scopes={[
        { title: "Órdenes", description: "Compra, venta, estado y ejecución." },
        { title: "Order book", description: "Profundidad, liquidez y spread por par." },
        { title: "Motor", description: "Contrato pendiente para matching engine por Gateway Admin." },
      ]}
    />
  )
}
