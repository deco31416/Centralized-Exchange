import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AssetsConfigPage() {
  return (
    <AdminModulePlaceholderPage
      title="Configuración de activos"
      description="Reglas operativas por activo, moneda, red y producto."
      state="pending"
      percent={25}
      scopes={[
        { title: "Estados", description: "Activo, pausado, solo lectura o retirado." },
        { title: "Límites", description: "Mínimos, máximos y precisión decimal." },
        { title: "Riesgo", description: "Reglas de exposición y restricciones por usuario." },
      ]}
    />
  )
}
