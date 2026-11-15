import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FinancialLimitesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Límites de usuario"
      description="Límites financieros por KYC, riesgo, moneda y producto."
      state="pending"
      percent={20}
      scopes={[
        { title: "Nivel KYC", description: "Límites según verificación básica, avanzada o institucional." },
        { title: "Perfil de riesgo", description: "Ajustes por riesgo bajo, medio, alto o revisión." },
        { title: "Producto", description: "Topes para depósitos, retiros, P2P, remesas y pagos." },
      ]}
    />
  )
}
