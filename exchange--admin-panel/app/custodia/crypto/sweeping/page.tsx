import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CryptoSweepingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Barrido"
      description="Movimientos automáticos o manuales entre wallets operativas y custodia."
      state="pending"
      percent={20}
      scopes={[
        { title: "Reglas", description: "Umbrales por activo, red y perfil operativo." },
        { title: "Ejecución", description: "Transacciones programadas, pendientes y cerradas." },
        { title: "Seguridad", description: "Aprobaciones, límites y alertas de riesgo." },
      ]}
    />
  )
}
