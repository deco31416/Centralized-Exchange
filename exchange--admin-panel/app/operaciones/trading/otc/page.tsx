import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function OtcTradingPage() {
  return (
    <AdminModulePlaceholderPage
      title="OTC"
      description="Operaciones OTC para tickets grandes y negociación asistida."
      state="pending"
      percent={5}
      note="I+D+i. Pendiente de mesa OTC, permisos, límites y flujo operativo."
      scopes={[
        { title: "Cotización", description: "Solicitud, vigencia y aceptación de precio." },
        { title: "Contraparte", description: "KYC, riesgo y límites institucionales." },
        { title: "Liquidación", description: "Entrega fiat/crypto y conciliación." },
      ]}
    />
  )
}
