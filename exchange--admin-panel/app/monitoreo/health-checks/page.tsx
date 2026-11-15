"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function HealthChecksPage() {
  return (
    <AdminModulePlaceholderPage
      title="Salud de servicios"
      description="Estado operativo de gateways, microservicios, bases de datos, Redis y dependencias críticas."
      state="pending"
      percent={10}
      note="Pendiente conectar endpoints /health reales de cada servicio y agregarlos por gateway admin."
      scopes={[
        {
          title: "Servicios",
          description: "Gateway admin, gateway user y microservicios por dominio.",
        },
        {
          title: "Infraestructura",
          description: "MongoDB, Redis, colas, providers y conectores externos.",
        },
        {
          title: "Alertas",
          description: "Uptime, degradación, latencia, errores y escalamiento.",
        },
      ]}
    />
  )
}
