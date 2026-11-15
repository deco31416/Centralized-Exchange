import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CryptoDeclaracionFondosPage() {
  return (
    <AdminModulePlaceholderPage
      title="Declaración de fondos crypto"
      description="Declaración y trazabilidad de fondos cripto custodiados."
      state="pending"
      percent={15}
      scopes={[
        { title: "Origen", description: "Wallet, red, transacción y proveedor asociado." },
        { title: "Reserva", description: "Fondos propios, usuarios y pasivos relacionados." },
        { title: "Evidencia", description: "Soportes para auditoría y cumplimiento." },
      ]}
    />
  )
}
