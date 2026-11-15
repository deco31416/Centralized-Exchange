import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function MetricasNegocioPage() {
  return (
    <AdminModulePlaceholderPage
      title="Métricas de negocio"
      description="Indicadores de adopción, operación, producto y crecimiento."
      state="pending"
      percent={10}
      scopes={[
        { title: "Adopción", description: "Usuarios, activación, retención y cohortes." },
        { title: "Producto", description: "Uso por wallet, P2P, remesas, pagos e intercambio." },
        { title: "Operación", description: "Volumen, frecuencia, conversión y fricción." },
      ]}
    />
  )
}
