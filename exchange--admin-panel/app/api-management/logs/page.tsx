"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function ApiLogsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Logs de API"
      description="Consulta de trazas API, errores, latencias, origen de solicitudes y eventos de seguridad."
      state="pending"
      percent={10}
      note="Pendiente conectar observabilidad real y logs agregados por gateway admin."
      scopes={[
        { title: "Trazas", description: "Método, ruta, usuario, estado y correlación." },
        { title: "Seguridad", description: "IPs, bloqueo, rate limit y fallos de autenticación." },
        { title: "Observabilidad", description: "Latencia, errores, filtros y exportación." },
      ]}
    />
  )
}
