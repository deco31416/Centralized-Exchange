import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function VolumenTradingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Volumen de trading"
      description="Volumen por producto, par, moneda, país y periodo."
      state="pending"
      percent={10}
      scopes={[
        { title: "Producto", description: "Spot, P2P, intercambio, pagos y remesas." },
        { title: "Mercado", description: "Pares, monedas y rutas de liquidez." },
        { title: "Periodo", description: "Día, semana, mes y cortes personalizados." },
      ]}
    />
  )
}
