import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function RevenuePage() {
  return (
    <AdminModulePlaceholderPage
      title="Revenue dashboard"
      description="Ingresos, comisiones, costos y margen operativo por línea de negocio."
      state="pending"
      percent={10}
      scopes={[
        { title: "Ingresos", description: "Comisiones por producto, país y moneda." },
        { title: "Costos", description: "Proveedores, redes, bancos y pasarelas." },
        { title: "Margen", description: "Resultado neto por producto y periodo." },
      ]}
    />
  )
}
