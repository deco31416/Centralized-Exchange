import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AnalisisProfundidadPage() {
  return (
    <AdminModulePlaceholderPage
      title="Análisis de profundidad"
      description="Lectura de liquidez disponible por mercado, par y proveedor."
      state="pending"
      percent={10}
      scopes={[
        { title: "Profundidad", description: "Volumen disponible por niveles de precio." },
        { title: "Slippage", description: "Impacto esperado por tamaño de orden." },
        { title: "Cobertura", description: "Comparación entre liquidez propia y externa." },
      ]}
    />
  )
}
