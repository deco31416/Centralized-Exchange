"use client"

import { IconFileText, IconFolderShare, IconShieldCheck } from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const documentScopes = [
  {
    title: "Identidad",
    description: "Documento, selfie, prueba de vida y validación básica.",
    Icon: IconFileText,
  },
  {
    title: "Soporte financiero",
    description: "Origen de fondos, actividad esperada y soportes de riesgo.",
    Icon: IconFolderShare,
  },
  {
    title: "Evidencia de revisión",
    description: "Decisiones, notas del analista y trazabilidad de cumplimiento.",
    Icon: IconShieldCheck,
  },
]

export default function KYCDocumentosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Documentos y evidencias KYC"
        description="Repositorio documental para identidad, soporte y revisión de cumplimiento"
        state="pending"
        percent={15}
        note="Pendiente de endpoint documental por Gateway Admin. No se muestran documentos simulados."
      />

      <Card className="rounded-[1.5rem]">
        <CardHeader>
          <CardTitle>Repositorio pendiente</CardTitle>
          <CardDescription className="leading-6">
            Esta vista queda lista para conectar documentos reales cuando KYC/Risk exponga
            almacenamiento, metadatos, revisión y permisos de descarga segura.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {documentScopes.map(({ title, description, Icon }) => (
          <Card key={title} className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-4 flex size-12 items-center justify-center rounded-full border bg-background">
                <Icon className="size-6 text-primary" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="leading-6">{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
