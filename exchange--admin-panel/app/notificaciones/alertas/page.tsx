"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AlertasAutomaticasPage() {
  return (
    <AdminModulePlaceholderPage
      title="Alertas automáticas"
      description="Reglas de notificación automática para eventos operativos, seguridad, KYC, pagos y riesgo."
      state="pending"
      percent={10}
      note="Pendiente conectar motor de eventos y reglas de alertamiento por gateway admin."
      scopes={[
        {
          title: "Reglas",
          description: "Condiciones, severidad, canal y destinatarios.",
        },
        {
          title: "Eventos",
          description: "Alertas de seguridad, operaciones, KYC y estado de servicios.",
        },
        {
          title: "Auditoría",
          description: "Historial de disparos, entregas y responsables.",
        },
      ]}
    />
  )
}
