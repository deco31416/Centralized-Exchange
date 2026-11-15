"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function ApiKeysPage() {
  return (
    <AdminModulePlaceholderPage
      title="API keys de usuarios"
      description="Gestión de credenciales API, permisos, rotación, revocación y actividad por usuario."
      state="pending"
      percent={10}
      note="Pendiente conectar vault y servicio de API keys por gateway admin."
      scopes={[
        { title: "Credenciales", description: "Creación, rotación, revocación y scopes." },
        { title: "Permisos", description: "Lectura, trading, pagos, webhooks y administración." },
        { title: "Auditoría", description: "Uso, origen, fallos y eventos de seguridad." },
      ]}
    />
  )
}
