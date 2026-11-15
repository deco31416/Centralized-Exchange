import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatCuentasBancariasPage() {
  return (
    <AdminModulePlaceholderPage
      title="Cuentas bancarias"
      description="Cuentas operativas, concentradoras y cuentas vinculadas por usuario."
      state="pending"
      percent={20}
      scopes={[
        { title: "Cuentas propias", description: "Cuentas de operación por país y moneda." },
        { title: "Cuentas usuario", description: "Cuentas verificadas para retiros y pagos." },
        { title: "Validación", description: "Estado, titularidad y restricciones." },
      ]}
    />
  )
}
