"use client"

import { BadgeDollarSign, Code2, FileCheck2, Landmark, ShieldCheck, WalletCards } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function CryptoProcessingLegalPage() {
  return (
    <DecoReferencePage
      eyebrow="Procesamiento para comercios"
      title="Política de Procesamiento Cripto"
      breadcrumb="Procesamiento Cripto"
      description="Condiciones informativas para comercios e integradores que quieran aceptar, consultar o liquidar pagos cripto mediante Deco Exchange."
      chartLabel="Estado de servicio"
      chartValue="Comercial"
      chartDelta="Sujeto a KYB, país y proveedor"
      calculatorTitle="Servicio condicionado"
      calculatorDescription="La activación final depende de verificación, riesgo, contratos y disponibilidad operativa."
      statsTitle="Condiciones base"
      stats={[
        { label: "Comercio", value: "KYB", detail: "Validación empresarial" },
        { label: "Riesgo", value: "AML", detail: "Monitoreo por operación" },
        { label: "Liquidación", value: "Variable", detail: "Cripto o fiat" },
      ]}
      itemsTitle="Reglas de operación"
      items={[
        { title: "Orden de pago", description: "Cada operación debe tener ID, monto, moneda y estado.", Icon: FileCheck2 },
        { title: "Activos compatibles", description: "La disponibilidad depende de red, país y proveedor.", Icon: WalletCards },
        { title: "Liquidación", description: "La conversión a fiat puede depender de terceros y jurisdicción.", Icon: Landmark },
        { title: "APIs", description: "Las integraciones requieren credenciales, límites y monitoreo.", Icon: Code2 },
        { title: "Riesgo", description: "Deco puede retener, rechazar o revisar operaciones sospechosas.", Icon: ShieldCheck },
        { title: "Comisiones", description: "Los fees dependen de red, proveedor, volumen y contrato.", Icon: BadgeDollarSign },
      ]}
      trends={[
        { label: "Checkout", value: "API", detail: "Dev" },
        { label: "Settlement", value: "Variable", detail: "País" },
        { label: "KYB", value: "Requerido", detail: "Empresa" },
        { label: "AML", value: "Activo", detail: "Riesgo" },
      ]}
      noteTitle="Aviso operativo"
      note="El procesamiento cripto no garantiza aprobación de comercios, aceptación de todos los activos, liquidación inmediata ni disponibilidad por país. Toda activación queda sujeta a verificación, contrato, licencias, proveedores, controles AML y seguridad."
      ctaHref="/business/crypto-processing"
      ctaLabel="Ver página comercial"
    />
  )
}
