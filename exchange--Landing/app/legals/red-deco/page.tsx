"use client"

import { Banknote, Building2, Landmark, MapPin, ShieldCheck, WalletCards } from "lucide-react"
import { DecoReferencePage } from "@/components/common/legals/deco-reference-page"

export default function RedDecoLegalPage() {
  return (
    <DecoReferencePage
      eyebrow="Red fisica aliada"
      title="Red Deco"
      breadcrumb="Red Deco"
      description="Aviso informativo sobre aliados verificados, efectivo, retiros y remesas presenciales dentro del ecosistema Deco."
      chartLabel="Cobertura referencial"
      chartValue="LatAm"
      chartDelta="Disponibilidad sujeta a pais, KYC/KYB y aliado"
      calculatorTitle="Simulacion Red Deco"
      calculatorDescription="La operacion final depende de tasa, ruta, aliado disponible, limites y verificacion del usuario."
      statsTitle="Alcance y control"
      stats={[
        { label: "Servicios", value: "4", detail: "Deposito, retiro, cambio y remesa" },
        { label: "Datos exactos", value: "Login", detail: "Solo con orden aceptada" },
        { label: "Riesgo", value: "AML", detail: "Monitoreo por corredor" },
      ]}
      itemsTitle="Reglas publicas"
      items={[
        { title: "Zona aproximada", description: "La direccion exacta no se muestra antes de aceptar la operacion.", Icon: MapPin },
        { title: "Efectivo controlado", description: "Los limites se definen por pais, aliado, horario y nivel del usuario.", Icon: Banknote },
        { title: "Aliados verificados", description: "Cada aliado debe cumplir validacion, permisos y monitoreo operativo.", Icon: ShieldCheck },
        { title: "Remesas trazables", description: "La ruta puede combinar aliado, banco, wallet, P2P o tesoreria.", Icon: Landmark },
        { title: "Comprobantes", description: "Cada operacion debe generar registro para usuario, aliado y Deco.", Icon: WalletCards },
        { title: "Comercios", description: "Los comercios habilitados operan con reglas y cupos diferenciados.", Icon: Building2 },
      ]}
      trends={[
        { label: "Deposito", value: "Presencial", detail: "KYC" },
        { label: "Retiro", value: "Saldo a efectivo", detail: "QR" },
        { label: "Remesa", value: "Ruta mixta", detail: "AML" },
        { label: "P2P", value: "Apoyo cercano", detail: "Riesgo" },
      ]}
      noteTitle="Aviso Red Deco"
      note="Red Deco es una experiencia frontend referencial. La disponibilidad real, montos, comisiones, aliados, rutas de remesa y operaciones presenciales quedan sujetos a licencias, pais, KYC/KYB, riesgo, cumplimiento y contratos operativos vigentes."
      ctaHref="/bolsillito/red-deco"
      ctaLabel="Ver Red Deco"
    />
  )
}
