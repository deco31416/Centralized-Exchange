"use client"

import { Bitcoin, CircleDollarSign, Coins, Gem, Globe2, WalletCards } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function MonedasPage() {
  return (
    <DecoReferencePage
      eyebrow="Activos y monedas"
      title="Información de monedas"
      breadcrumb="Monedas"
      description="Consulta información educativa sobre monedas fiat, criptoactivos y activos disponibles como referencia dentro del ecosistema DECO EXCHANGE."
      chartLabel="Activo destacado"
      chartValue="BTC / USD"
      chartDelta="+0.00% referencia visual"
      calculatorTitle="Calculadora por moneda"
      calculatorDescription="Selecciona una moneda o activo para revisar una referencia de precio, tasa o disponibilidad."
      statsTitle="Cobertura educativa"
      stats={[
        { label: "Criptoactivos", value: "18+", detail: "BTC, ETH, SOL y más" },
        { label: "Fiat", value: "14+", detail: "USD, COP, MXN, DOP..." },
        { label: "Categorías", value: "4", detail: "Cripto, fiat, pagos y remesas" },
      ]}
      itemsTitle="Monedas principales"
      items={[
        { title: "Bitcoin", description: "Activo digital usado como referencia principal de mercado.", Icon: Bitcoin },
        { title: "Ethereum", description: "Red y activo para contratos inteligentes y ecosistemas Web3.", Icon: Gem },
        { title: "Solana", description: "Activo digital de alta actividad dentro del mercado cripto.", Icon: Coins },
        { title: "Dólar estadounidense", description: "Moneda fiat base para referencias globales.", Icon: CircleDollarSign },
        { title: "Peso colombiano", description: "Referencia fiat local para operaciones regionales.", Icon: Globe2 },
        { title: "DECOToken", description: "Activo digital del ecosistema DECO para utilidad y comunidad.", Icon: WalletCards },
      ]}
      trends={[
        { label: "BTC", value: "$65,000.00", detail: "0.00%" },
        { label: "ETH", value: "$3,500.00", detail: "0.00%" },
        { label: "SOL", value: "$150.00", detail: "0.00%" },
        { label: "COP", value: "4,000.00", detail: "0.00%" },
      ]}
      noteTitle="Educación antes de operar"
      note="Esta información ayuda a entender activos y monedas, pero no representa recomendación de inversión, promesa de rendimiento ni disponibilidad operativa garantizada."
      ctaHref="/assets"
      ctaLabel="Ver catálogo de activos"
    />
  )
}
