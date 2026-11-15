"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function MaintenancePage() {
  return (
    <AdminModulePlaceholderPage
      title="Mantenimiento"
      description="Ventanas de mantenimiento, mensajes al usuario, accesos permitidos y pausa operativa por producto."
      state="pending"
      percent={10}
      note="Pendiente conectar feature flags, mensajes públicos y control de disponibilidad por gateway admin."
      scopes={[
        { title: "Ventanas", description: "Programación, duración, productos afectados y responsables." },
        { title: "Mensajes", description: "Avisos web, app, email y soporte." },
        { title: "Acceso", description: "Excepciones internas, auditoría y reactivación." },
      ]}
    />
  )
}
