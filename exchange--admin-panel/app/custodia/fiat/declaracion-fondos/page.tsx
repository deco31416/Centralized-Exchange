import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatDeclaracionFondosPage() {
  return (
    <AdminModulePlaceholderPage
      title="Declaración de fondos fiat"
      description="Declaración de fondos fiat por cuenta, proveedor, país y moneda."
      state="pending"
      percent={15}
      scopes={[
        { title: "Origen", description: "Banco, pasarela o método de pago." },
        { title: "Asignación", description: "Fondos propios, usuarios y pasivos." },
        { title: "Soporte", description: "Documentos y evidencia para auditoría." },
      ]}
    />
  )
}
