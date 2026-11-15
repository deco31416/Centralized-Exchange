"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function BlockchainSyncPage() {
  return (
    <AdminModulePlaceholderPage
      title="Blockchain sync"
      description="Monitoreo de nodos, alturas de bloque, confirmaciones y sincronización de redes soportadas."
      state="pending"
      percent={10}
      note="Pendiente conectar indexadores, nodos y estado de sincronización por gateway admin."
      scopes={[
        {
          title: "Nodos",
          description: "Estado de nodos por red, proveedor y región.",
        },
        {
          title: "Bloques",
          description: "Alturas, retrasos, confirmaciones y eventos pendientes.",
        },
        {
          title: "Operación",
          description: "Reintentos, pausas, alertas y bitácora de sincronización.",
        },
      ]}
    />
  )
}
