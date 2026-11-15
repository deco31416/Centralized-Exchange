"use client"

import { BadgeDollarSign, Code2, Landmark, ReceiptText, ShieldCheck, WalletCards } from "lucide-react"

import {
  CompanyCard,
  CompanyHero,
  CompanyPageShell,
  CompanySection,
  type CompanyCardItem,
} from "@/components/company/shared/company-shell"

const processingMetrics = [
  { label: "Pagos", value: "Cripto", detail: "Checkout, API y liquidación" },
  { label: "Liquidación", value: "Fiat", detail: "Sujeta a país y proveedor" },
  { label: "Control", value: "AML", detail: "Riesgo, límites y trazabilidad" },
]

const processingFlows: CompanyCardItem[] = [
  {
    eyebrow: "01",
    title: "Checkout cripto",
    description: "El comercio genera una orden, el usuario paga con activo compatible y Deco confirma estado referencial.",
    Icon: ReceiptText,
  },
  {
    eyebrow: "02",
    title: "Liquidación",
    description: "El saldo puede mantenerse en cripto, convertirse a fiat o enviarse a wallet según disponibilidad.",
    Icon: WalletCards,
  },
  {
    eyebrow: "03",
    title: "Conciliación",
    description: "Cada pago conserva ID, red, hash, monto, moneda, estado y referencias para reportes.",
    Icon: Landmark,
  },
  {
    eyebrow: "04",
    title: "Riesgo",
    description: "Las reglas AML, límites, alertas y retenciones dependen de usuario, país y comercio.",
    Icon: ShieldCheck,
  },
]

const integrationItems: CompanyCardItem[] = [
  {
    eyebrow: "API",
    title: "Endpoints de pago",
    description: "Crear orden, consultar estado, confirmar settlement, cancelar, reembolsar y exportar reportes.",
    meta: "Futuro gateway",
    Icon: Code2,
  },
  {
    eyebrow: "Widgets",
    title: "Componentes embebibles",
    description: "Checkout, calculadora, selector de activo, estado de red y comprobante para e-commerce.",
    meta: "Conecta con plugins",
    Icon: BadgeDollarSign,
  },
]

export function CryptoProcessingPage() {
  return (
    <CompanyPageShell>
      <CompanyHero
        eyebrow="Empresas · Procesamiento"
        title="Procesamiento Cripto"
        description="Una capa comercial para comercios y plataformas que quieren aceptar pagos cripto, consultar estados, liquidar y mantener trazabilidad sin mezclarlo con el catálogo de activos."
        metrics={processingMetrics}
        actions={[
          { href: "/legals/crypto-processing", label: "Ver condiciones" },
          { href: "/developers", label: "Portal developers", variant: "secondary" },
        ]}
      />

      <CompanySection
        eyebrow="Flujo"
        title="Cómo se procesa un pago"
        description="La experiencia se diseña para que el comercio entienda estado, riesgo, liquidación y soporte antes de conectar el backend."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {processingFlows.map((item) => (
            <CompanyCard key={item.title} {...item} />
          ))}
        </div>
      </CompanySection>

      <CompanySection eyebrow="Integración" title="Piezas técnicas">
        <div className="grid gap-4 md:grid-cols-2">
          {integrationItems.map((item) => (
            <CompanyCard key={item.title} {...item} />
          ))}
        </div>
      </CompanySection>
    </CompanyPageShell>
  )
}
