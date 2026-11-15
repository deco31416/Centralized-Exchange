import OrderHistoryContainer from "@/components/markets/order-history/order-history-container"

export const metadata = {
  title: "Historial de Órdenes | deco-exchange",
  description: "Consulta órdenes, fills y actividad de mercado.",
}

export default function OrderHistoryPage() {
  return <OrderHistoryContainer />
}
