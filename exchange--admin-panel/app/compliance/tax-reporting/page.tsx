"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TaxReportingPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reportes fiscales"
      description="Centro de reportes fiscales, retenciones, soportes y disponibilidad tributaria por jurisdicción."
      state="pending"
      percent={10}
      note="Pendiente conectar reportes fiscales reales y reglas por país desde gateway admin."
      scopes={[
        {
          title: "Reportes",
          description: "Reportes por usuario, periodo, moneda y producto.",
        },
        {
          title: "Soportes",
          description: "Descargas fiscales con trazabilidad.",
        },
        {
          title: "Reglas",
          description: "Reglas tributarias por país y tipo de operación.",
        },
      ]}
    />
  )
}
