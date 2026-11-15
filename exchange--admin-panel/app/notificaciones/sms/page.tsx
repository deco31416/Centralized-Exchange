"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SMSPage() {
  return (
    <AdminModulePlaceholderPage
      title="Configuración SMS"
      description="Canal SMS para códigos, avisos de seguridad y comunicaciones transaccionales."
      state="pending"
      percent={10}
      note="Pendiente conectar proveedor SMS, costos reales y políticas de envío por gateway admin."
      scopes={[
        {
          title: "Proveedor",
          description: "Credenciales, países soportados y rutas de envío.",
        },
        {
          title: "Plantillas",
          description: "Mensajes transaccionales y variables aprobadas.",
        },
        {
          title: "Control",
          description: "Estados de entrega, reintentos y límites por usuario.",
        },
      ]}
    />
  )
}
