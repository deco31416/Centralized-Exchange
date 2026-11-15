import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function LiquidezOrderBookPage() {
  return (
    <AdminModulePlaceholderPage
      title="Order book management"
      description="Administración de profundidad, órdenes, spread y liquidez por par."
      state="pending"
      percent={5}
      note="I+D+i. Depende del trading engine y del canal de mercado."
      scopes={[
        { title: "Libro", description: "Bids, asks, niveles y volumen por precio." },
        { title: "Ejecución", description: "Órdenes propias, externas y rutas de liquidez." },
        { title: "Alertas", description: "Baja profundidad, spread alto o mercado detenido." },
      ]}
    />
  )
}
