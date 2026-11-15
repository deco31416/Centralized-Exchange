"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function GeneralSettingsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Configuración general"
      description="Parámetros generales de la plataforma, dominios, contactos, legales y disponibilidad operativa."
      state="pending"
      percent={10}
      note="Pendiente conectar configuración institucional real por gateway admin."
      scopes={[
        { title: "Identidad", description: "Nombre, marca, dominios y contactos oficiales." },
        { title: "Operación", description: "Disponibilidad, estados, países y canales." },
        { title: "Legales", description: "Términos, privacidad, AML y avisos regulatorios." },
      ]}
    />
  )
}
