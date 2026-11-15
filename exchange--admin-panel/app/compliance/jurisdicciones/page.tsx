"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function JurisdiccionesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Configuración por jurisdicción"
      description="Reglas de disponibilidad por país, región, moneda, canal de pago y estado regulatorio."
      state="pending"
      percent={10}
      note="Pendiente conectar catálogo regulatorio y restricciones operativas por gateway admin."
      scopes={[
        {
          title: "Regiones",
          description: "Países habilitados, restringidos o en revisión.",
        },
        {
          title: "Disponibilidad",
          description: "Productos, monedas fiat y métodos de pago por región.",
        },
        {
          title: "Cambios",
          description: "Historial regulatorio y responsables internos.",
        },
      ]}
    />
  )
}
