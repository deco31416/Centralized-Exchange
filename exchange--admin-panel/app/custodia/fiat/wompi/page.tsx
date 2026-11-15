import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatWompiPage() {
  return (
    <AdminModulePlaceholderPage
      title="Wompi"
      description="Integración para pagos locales, recaudo y conciliación."
      state="pending"
      percent={15}
      scopes={[
        { title: "Recaudo", description: "Pagos aprobados, pendientes y rechazados." },
        { title: "Métodos", description: "Tarjetas, PSE y canales disponibles." },
        { title: "Conciliación", description: "Referencias externas contra ledger." },
      ]}
    />
  )
}
