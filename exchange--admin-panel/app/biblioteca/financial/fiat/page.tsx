import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FinancialFiatPage() {
  return (
    <AdminModulePlaceholderPage
      title="Balances fiat"
      description="Saldos fiat por usuario, país, moneda y bolsillito."
      state="pending"
      percent={25}
      scopes={[
        { title: "Saldos por moneda", description: "COP, USD, MXN, VES y monedas habilitadas." },
        { title: "Bolsillito fiat", description: "Saldo disponible, reservado y retenido." },
        { title: "Fuentes de pago", description: "Relación con bancos, métodos locales y conciliación." },
      ]}
    />
  )
}
