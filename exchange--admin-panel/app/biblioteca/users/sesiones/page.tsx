"use client"

import { UsersSectionPage } from "@/components/biblioteca/users/users-section-page"

export default function HistorialSesionesPage() {
  return (
    <UsersSectionPage
      title="Historial de sesiones"
      description="Accesos y sesiones de usuarios finales"
      state="pending"
      percent={15}
      variant="pending"
      note="Pendiente de endpoint de sesiones de usuarios finales por Gateway Admin."
    />
  )
}
