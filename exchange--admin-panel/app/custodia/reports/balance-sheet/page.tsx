import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CustodyBalanceSheetPage() {
  return (
    <AdminModulePlaceholderPage
      title="Hoja de balance"
      description="Resumen de activos, pasivos y saldos custodiados."
      state="pending"
      percent={20}
      scopes={[
        { title: "Activos", description: "Fondos fiat y crypto bajo custodia." },
        { title: "Pasivos", description: "Saldos comprometidos con usuarios." },
        { title: "Cierre", description: "Cortes diarios, mensuales y auditoría." },
      ]}
    />
  )
}
