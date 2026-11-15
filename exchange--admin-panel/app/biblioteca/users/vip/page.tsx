"use client"

import { UsersSectionPage } from "@/components/biblioteca/users/users-section-page"

export default function UsuariosVIPPage() {
  return (
    <UsersSectionPage
      title="Usuarios VIP"
      description="Segmentación premium cuando el backend exponga niveles o tier"
      role="vip"
      percent={25}
      note="La vista está preparada; requiere que Auth o Perfil Financiero exponga tier operativo."
    />
  )
}
