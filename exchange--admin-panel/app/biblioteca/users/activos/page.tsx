"use client"

import { UsersSectionPage } from "@/components/biblioteca/users/users-section-page"

export default function UsuariosActivosPage() {
  return (
    <UsersSectionPage
      title="Usuarios activos"
      description="Usuarios habilitados o con estado activo en la plataforma"
      status="active"
      percent={45}
    />
  )
}
