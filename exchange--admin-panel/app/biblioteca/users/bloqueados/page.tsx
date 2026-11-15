"use client"

import { UsersSectionPage } from "@/components/biblioteca/users/users-section-page"

export default function UsuariosBloqueadosPage() {
  return (
    <UsersSectionPage
      title="Usuarios bloqueados"
      description="Cuentas suspendidas por seguridad, operación o cumplimiento"
      status="locked"
      percent={45}
    />
  )
}
