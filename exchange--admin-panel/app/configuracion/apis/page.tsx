"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function ConfigApisPage() {
  return (
    <AdminModulePlaceholderPage
      title="Config APIs"
      description="Credenciales, proveedores, timeouts, reintentos y políticas de integración para servicios externos."
      state="pending"
      percent={10}
      note="Pendiente conectar vault, secrets y configuración real por gateway admin."
      scopes={[
        { title: "Proveedores", description: "APIs externas, credenciales y estados de conexión." },
        { title: "Seguridad", description: "Secrets, rotación, permisos y auditoría." },
        { title: "Operación", description: "Timeouts, reintentos, límites y alertas." },
      ]}
    />
  )
}
