"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function DocumentacionApiPage() {
  return (
    <AdminModulePlaceholderPage
      title="Documentación API"
      description="Documentación operativa de endpoints, permisos, payloads y contratos disponibles para integraciones."
      state="pending"
      percent={10}
      note="Pendiente generar documentación desde contratos reales de gateway admin y gateway user."
      scopes={[
        { title: "Contratos", description: "Endpoints versionados, payloads, errores y permisos." },
        { title: "Guías", description: "Casos de uso, autenticación y mejores prácticas." },
        { title: "Versionado", description: "Cambios, deprecaciones y compatibilidad." },
      ]}
    />
  )
}
