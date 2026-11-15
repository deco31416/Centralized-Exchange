"use client"

import { UsersSectionPage } from "@/components/biblioteca/users/users-section-page"

export default function UsuariosPendientesPage() {
  return (
    <UsersSectionPage
      title="Usuarios pendientes"
      description="Cuentas creadas sin verificación o activación completa"
      status="pending_verification"
      percent={45}
    />
  )
}
