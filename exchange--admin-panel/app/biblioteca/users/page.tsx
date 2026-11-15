"use client"

import { UsersSectionPage } from "@/components/biblioteca/users/users-section-page"

export default function UsersPage() {
  return (
    <UsersSectionPage
      title="Usuarios"
      description="Cuentas, estados y segmentación inicial de usuarios"
      variant="index"
      percent={45}
      note="Conteo y listado pasan por Gateway Admin cuando el micro de auth expone la fuente disponible."
    />
  )
}
