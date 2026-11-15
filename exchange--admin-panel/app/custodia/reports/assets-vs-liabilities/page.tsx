import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CustodyAssetsVsLiabilitiesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Activos vs pasivos"
      description="Comparación de fondos custodiados contra obligaciones de usuarios."
      state="pending"
      percent={20}
      scopes={[
        { title: "Cobertura", description: "Relación entre activos disponibles y pasivos." },
        { title: "Diferencias", description: "Brechas, alertas y revisión financiera." },
        { title: "Cortes", description: "Histórico por fecha, moneda y producto." },
      ]}
    />
  )
}
