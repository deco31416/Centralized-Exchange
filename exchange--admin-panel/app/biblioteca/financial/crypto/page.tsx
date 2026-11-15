import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FinancialCryptoPage() {
  return (
    <AdminModulePlaceholderPage
      title="Balances crypto"
      description="Lectura de saldos cripto por usuario, activo y red."
      state="pending"
      percent={25}
      scopes={[
        { title: "Saldos por activo", description: "BTC, ETH, USDT y activos compatibles." },
        { title: "Exposición de usuario", description: "Tenencia agregada y distribución por cuenta." },
        { title: "Reconciliación", description: "Comparación contra ledger y custodia crypto." },
      ]}
    />
  )
}
