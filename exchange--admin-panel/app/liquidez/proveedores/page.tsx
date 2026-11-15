import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function ProveedoresLiquidezPage() {
  return (
    <AdminModulePlaceholderPage
      title="Proveedores de liquidez"
      description="Proveedores internos o externos disponibles para profundidad de mercado."
      state="pending"
      percent={10}
      scopes={[
        { title: "Proveedores", description: "Entidad, producto, país y estado de integración." },
        { title: "Límites", description: "Capacidad, moneda, par y política de exposición." },
        { title: "Conciliación", description: "Órdenes, liquidación y reportes por proveedor." },
      ]}
    />
  )
}
