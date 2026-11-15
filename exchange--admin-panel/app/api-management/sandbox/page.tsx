"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SandboxPage() {
  return (
    <AdminModulePlaceholderPage
      title="Sandbox / Testing"
      description="Entorno de pruebas para integraciones, API keys de sandbox, datos aislados y validación de flujos."
      state="pending"
      percent={10}
      note="Pendiente conectar sandbox real y separación de datos de desarrollo por gateway admin."
      scopes={[
        { title: "Ambiente", description: "URLs, credenciales, límites y aislamiento." },
        { title: "Pruebas", description: "Flujos de compra, venta, P2P, pagos y webhooks." },
        { title: "Control", description: "Reset de datos, auditoría y estado del entorno." },
      ]}
    />
  )
}
