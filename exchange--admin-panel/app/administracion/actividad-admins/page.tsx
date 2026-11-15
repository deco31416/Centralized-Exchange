"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconActivity, IconClock, IconDatabase, IconShieldCheck } from "@tabler/icons-react"

const plannedSignals = [
  {
    title: "Eventos de sesión",
    description: "Login, logout, revocación de sesión y verificación OTP.",
    Icon: IconClock,
  },
  {
    title: "Cambios administrativos",
    description: "Roles, permisos, altas, bajas y cambios de estado.",
    Icon: IconShieldCheck,
  },
  {
    title: "Trazabilidad operativa",
    description: "Acciones sensibles sobre usuarios, fondos, custodia y configuración.",
    Icon: IconActivity,
  },
]

export default function ActividadAdminsPage() {
  return (
    <div className="space-y-6">
      <PageConnectionHeader
        title="Actividad Admins"
        description="Registro de eventos administrativos y acciones sensibles"
        state="pending"
        percent={15}
        note="Pendiente de microservicio de auditoría administrativa. No se muestran eventos simulados."
      />

      <Card className="rounded-[1.5rem]">
        <CardHeader>
          <CardTitle>Audit trail administrativo</CardTitle>
          <CardDescription>
            Esta vista queda reservada para eventos reales emitidos por Gateway Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.25rem] border bg-muted/25 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-full border bg-background">
                  <IconDatabase className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold">Sin fuente de eventos conectada</p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    El panel necesita un stream o API de auditoría para listar actividad real.
                    Mientras ese micro no exista, esta sección se mantiene como pendiente.
                  </p>
                </div>
              </div>
              <div className="rounded-full border px-4 py-2 text-sm font-semibold text-muted-foreground">
                Gateway admin pendiente
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plannedSignals.map(({ title, description, Icon }) => (
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
