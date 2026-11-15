"use client"

import { BadgeDollarSign, CreditCard, Landmark, QrCode, Smartphone, WalletCards } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function ElectronicosPage() {
  return (
    <DecoReferencePage
      eyebrow="Métodos digitales"
      title="Métodos electrónicos"
      breadcrumb="Métodos electrónicos"
      description="Explora referencias de métodos electrónicos, pagos digitales, transferencias y billeteras disponibles para experiencias fiat y cripto."
      chartLabel="Referencia de método"
      chartValue="Wallet digital"
      chartDelta="+0.00% disponibilidad visual"
      calculatorTitle="Simulador de método"
      calculatorDescription="Compara una referencia entre moneda, método electrónico y tipo de operación antes de continuar."
      statsTitle="Medios electrónicos"
      stats={[
        { label: "Transferencias", value: "ACH", detail: "Según país" },
        { label: "Billeteras", value: "Wallets", detail: "Locales y globales" },
        { label: "Tarjetas", value: "Cards", detail: "Sujeto a emisor" },
      ]}
      itemsTitle="Métodos disponibles"
      items={[
        { title: "Transferencias bancarias", description: "ACH, wire, SEPA y transferencias locales según disponibilidad.", Icon: Landmark },
        { title: "Tarjetas", description: "Tarjetas débito o crédito sujetas a emisor, país y validación.", Icon: CreditCard },
        { title: "Billeteras digitales", description: "Wallets y métodos locales para pagos electrónicos.", Icon: WalletCards },
        { title: "Códigos QR", description: "Flujos de pago mediante QR cuando el país y proveedor lo permitan.", Icon: QrCode },
        { title: "Pagos móviles", description: "Métodos móviles regionales integrables al ecosistema.", Icon: Smartphone },
        { title: "Procesamiento cripto", description: "Conexión entre activos digitales y medios electrónicos.", Icon: BadgeDollarSign },
      ]}
      trends={[
        { label: "ACH", value: "0-24h", detail: "Ref." },
        { label: "Tarjeta", value: "Inmediato", detail: "Ref." },
        { label: "Wallet", value: "Variable", detail: "Ref." },
        { label: "QR", value: "Local", detail: "Ref." },
      ]}
      noteTitle="Aviso de disponibilidad"
      note="Los métodos electrónicos pueden variar por país, proveedor, validación de identidad, límites internos y cumplimiento regulatorio. La información es referencial y educativa."
      ctaHref="/assets/payment-methods"
      ctaLabel="Ver métodos de pago"
    />
  )
}
