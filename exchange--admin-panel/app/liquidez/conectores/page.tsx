import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function ConectoresExchangesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Conectores a exchanges"
      description="Conexiones externas para pricing, profundidad y ejecución."
      state="pending"
      percent={10}
      note="Pendiente de contratos, llaves, límites y aprobación operativa."
      scopes={[
        { title: "Credenciales", description: "Llaves, permisos y ambientes por proveedor." },
        { title: "Latencia", description: "Salud, respuesta y disponibilidad del conector." },
        { title: "Riesgo", description: "Límites, exposición y monitoreo de contraparte." },
      ]}
    />
  )
}
