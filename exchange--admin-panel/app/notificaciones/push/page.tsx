"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function PushPage() {
  return (
    <AdminModulePlaceholderPage
      title="Notificaciones push"
      description="Configuración de campañas y mensajes push para web, móvil y eventos transaccionales."
      state="pending"
      percent={10}
      note="Pendiente conectar proveedor push y preferencias de usuario por gateway admin."
      scopes={[
        {
          title: "Canales",
          description: "Web, móvil y dispositivos autorizados.",
        },
        {
          title: "Preferencias",
          description: "Consentimientos, silencios y segmentos.",
        },
        {
          title: "Entrega",
          description: "Estado, reintentos y auditoría de mensajes.",
        },
      ]}
    />
  )
}
