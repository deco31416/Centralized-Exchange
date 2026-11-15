import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function TransactionsDisputasPage() {
  return (
    <AdminModulePlaceholderPage
      title="Disputas"
      description="Transacciones con reclamo, investigación o intervención operativa."
      state="pending"
      percent={25}
      scopes={[
        { title: "Caso", description: "Usuario, contraparte, evidencia y estado." },
        { title: "Riesgo", description: "Señales AML, fraude o comportamiento anómalo." },
        { title: "Resolución", description: "Decisiones, reversos y comunicación al usuario." },
      ]}
    />
  )
}
