"use client"

import { ArrowRightLeft, Bitcoin, Banknote, CreditCard, ReceiptText, WalletCards } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"
import { DecoCalculatorExperience } from "@/components/common/legals/deco-calculator-experience"

export default function CalculadoraPage() {
  return (
    <DecoReferencePage
      eyebrow="Simulación de operaciones"
      title="Calculadora DECO"
      breadcrumb="Calculadora"
      description="Simula referencias entre fiat, cripto, efectivo y medios electrónicos para entender mejor una operación antes de iniciarla."
      chartLabel="Referencia de cálculo"
      chartValue="100 USD"
      chartDelta="400,000.00 COP estimado"
      leadSlot={<DecoCalculatorExperience />}
      calculatorTitle="Convierte con claridad"
      calculatorDescription="Elige monto, origen, destino y método para visualizar una referencia educativa de la operación."
      statsTitle="Qué puede comparar"
      stats={[
        { label: "Fiat", value: "14+", detail: "Monedas regionales" },
        { label: "Cripto", value: "18+", detail: "Activos digitales" },
        { label: "Métodos", value: "3", detail: "Fiat, efectivo y digital" },
      ]}
      itemsTitle="Tipos de cálculo"
      items={[
        { title: "Fiat a fiat", description: "COP, USD, MXN, DOP, VES y otras monedas soportadas.", Icon: Banknote },
        { title: "Fiat a cripto", description: "Referencia para compra o venta de activos digitales.", Icon: Bitcoin },
        { title: "Cripto a fiat", description: "Consulta estimaciones de liquidación hacia moneda local.", Icon: ArrowRightLeft },
        { title: "Efectivo", description: "Simulación de referencias para redes presenciales.", Icon: ReceiptText },
        { title: "Métodos electrónicos", description: "Comparación visual por tarjetas, transferencias y wallets.", Icon: CreditCard },
        { title: "Wallet DECO", description: "Vista educativa para conectar operaciones con la app.", Icon: WalletCards },
      ]}
      trends={[
        { label: "USD/COP", value: "4,000.00", detail: "Ref." },
        { label: "BTC/USD", value: "65,000.00", detail: "Ref." },
        { label: "ETH/USD", value: "3,500.00", detail: "Ref." },
        { label: "MXN/USD", value: "18.50", detail: "Ref." },
      ]}
      noteTitle="Resultado referencial"
      note="La calculadora no constituye cotización definitiva ni oferta financiera. Los resultados dependen de mercado, proveedor, disponibilidad, validación del usuario y regulación aplicable."
      ctaHref="/#tasas"
      ctaLabel="Ver tasas del home"
    />
  )
}
