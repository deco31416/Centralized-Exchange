import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function FiatBancosConectadosPage() {
  return (
    <AdminModulePlaceholderPage
      title="Bancos conectados"
      description="Instituciones bancarias vinculadas para fondeo, retiro y conciliación."
      state="pending"
      percent={20}
      scopes={[
        { title: "Instituciones", description: "Banco, país, moneda y estado de integración." },
        { title: "Canales", description: "Entradas, salidas, horarios y límites." },
        { title: "Salud", description: "Monitoreo de disponibilidad y fallas." },
      ]}
    />
  )
}
