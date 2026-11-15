"use client"

import { Banknote, Building2, CircleDollarSign, Landmark, MapPin, ShieldCheck } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function EfectivoPage() {
  return (
    <DecoReferencePage
      eyebrow="Canales presenciales"
      title="Efectivo"
      breadcrumb="Efectivo"
      description="Información sobre referencias de efectivo, redes presenciales, disponibilidad por país y controles aplicables antes de operar."
      chartLabel="Referencia efectivo"
      chartValue="USD 100.00"
      chartDelta="+0.00% disponibilidad visual"
      calculatorTitle="Simulación de efectivo"
      calculatorDescription="Consulta cómo podría verse una referencia de efectivo frente a moneda fiat o cripto antes de iniciar el flujo."
      statsTitle="Efectivo y cobertura"
      stats={[
        { label: "Canales", value: "6+", detail: "Redes y puntos aliados" },
        { label: "Monedas", value: "14+", detail: "Fiat regional" },
        { label: "Validación", value: "KYC", detail: "Según operación" },
      ]}
      itemsTitle="Monedas y efectivo"
      items={[
        { title: "USD", description: "Referencia principal para operaciones y consulta de valor.", Icon: CircleDollarSign },
        { title: "COP", description: "Peso colombiano para disponibilidad local y puntos de atención.", Icon: Banknote },
        { title: "MXN", description: "Peso mexicano como referencia regional fiat.", Icon: Landmark },
        { title: "PEN", description: "Sol peruano para cobertura de mercado latinoamericano.", Icon: MapPin },
        { title: "DOP", description: "Peso dominicano para rutas de efectivo y consulta.", Icon: Building2 },
        { title: "VES", description: "Bolívar venezolano como referencia informativa.", Icon: ShieldCheck },
      ]}
      trends={[
        { label: "USD", value: "Base", detail: "0.00%" },
        { label: "COP", value: "Local", detail: "0.00%" },
        { label: "MXN", value: "Regional", detail: "0.00%" },
        { label: "DOP", value: "Regional", detail: "0.00%" },
      ]}
      noteTitle="Aviso sobre efectivo"
      note="La disponibilidad de efectivo depende del país, red aliada, verificación del usuario, límites operativos y requisitos de cumplimiento. DECO EXCHANGE no ofrece servicios financieros activos hasta contar con las licencias correspondientes."
      ctaHref="/assets/payment-methods/cash"
      ctaLabel="Ver efectivo en Deco"
    />
  )
}
