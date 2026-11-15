"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function RateLimitingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Rate limiting"
      description="Control de límites de uso por usuario, API key, IP, producto, endpoint y perfil de riesgo."
      state="pending"
      percent={10}
      note="Pendiente conectar reglas de rate limit y enforcement por gateway admin."
      scopes={[
        { title: "Reglas", description: "Límites por endpoint, usuario, llave e IP." },
        { title: "Excepciones", description: "Allowlist, bloqueo y planes de integración." },
        { title: "Auditoría", description: "Eventos de throttling, abuso y cambios." },
      ]}
    />
  )
}
