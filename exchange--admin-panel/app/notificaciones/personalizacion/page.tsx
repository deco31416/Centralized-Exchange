"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function PersonalizacionPage() {
  return (
    <AdminModulePlaceholderPage
      title="Personalización"
      description="Preferencias globales de remitentes, idioma, horarios y experiencia de notificación por usuario."
      state="pending"
      percent={10}
      note="Pendiente conectar configuración real de remitentes, consentimientos y preferencias por gateway admin."
      scopes={[
        {
          title: "Remitentes",
          description: "Nombre, correo, reply-to y dominios verificados.",
        },
        {
          title: "Preferencias",
          description: "Opt-out, zona horaria, idioma y frecuencia.",
        },
        {
          title: "Gobierno",
          description: "Aprobación de cambios y bitácora de configuración.",
        },
      ]}
    />
  )
}
