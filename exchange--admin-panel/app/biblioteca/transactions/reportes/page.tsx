import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TransactionsReportesPage() {
  return (
    <AdminModulePlaceholderPage
      title="Reportes de transacciones"
      description="Reportes operativos, financieros y regulatorios sobre movimientos."
      state="pending"
      percent={20}
      scopes={[
        { title: "Operativo", description: "Volumen, estados y tiempos de procesamiento." },
        { title: "Financiero", description: "Montos por moneda, producto y jurisdicción." },
        { title: "Regulatorio", description: "Exportaciones para cumplimiento y auditoría." },
      ]}
    />
  )
}
