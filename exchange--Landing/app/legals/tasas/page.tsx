"use client"

import { Banknote, Globe2, Landmark, ReceiptText, Repeat2, WalletCards } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function TasasPage() {
  return (
    <DecoReferencePage
      eyebrow="Referencias fiat"
      title="Tasas de divisas fiat"
      breadcrumb="Tasas"
      description="Consulta referencias de compra, venta y disponibilidad para monedas fiat soportadas por el ecosistema DECO EXCHANGE."
      chartLabel="Referencia USD / COP"
      chartValue="4,000.00 COP"
      chartDelta="+0.00% referencia visual"
      calculatorTitle="Calculadora de tasas"
      calculatorDescription="Simula cambios entre monedas fiat, activos digitales y métodos disponibles antes de iniciar una operación."
      statsTitle="Resumen de tasas"
      stats={[
        { label: "Monedas fiat", value: "14+", detail: "Latam, USD, EUR y más" },
        { label: "Diferencial", value: "10.53%", detail: "Referencia visual" },
        { label: "Actualización", value: "24/7", detail: "Sujeta a disponibilidad" },
      ]}
      itemsTitle="Monedas y referencias disponibles"
      items={[
        { title: "USD / COP", description: "Dólar estadounidense frente al peso colombiano para operaciones referenciales.", Icon: Banknote },
        { title: "USD / MXN", description: "Referencia para peso mexicano y operaciones regionales.", Icon: Globe2 },
        { title: "USD / VES", description: "Referencia informativa para bolívar venezolano.", Icon: Repeat2 },
        { title: "USD / DOP", description: "Referencia para peso dominicano dentro de la cobertura fiat.", Icon: Landmark },
        { title: "BRL / USD", description: "Referencia para real brasileño y cruces regionales.", Icon: ReceiptText },
        { title: "AWG / USD", description: "Florín arubeño como moneda fiat incluida en el ecosistema.", Icon: WalletCards },
      ]}
      trends={[
        { label: "COP", value: "4,000.00", detail: "0.00%" },
        { label: "MXN", value: "18.50", detail: "0.00%" },
        { label: "VES", value: "36.50", detail: "0.00%" },
        { label: "DOP", value: "59.00", detail: "0.00%" },
      ]}
      noteTitle="Claridad operativa"
      note="Las tasas son referencias informativas. La operación final puede variar por liquidez, jurisdicción, validación del usuario, método de pago y disponibilidad regulatoria."
      ctaHref="/legals/calculadora"
      ctaLabel="Abrir calculadora"
    />
  )
}
