import {
  IconActivity,
  IconDatabase,
  IconPlugConnected,
  IconShieldCheck,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ConnectionState } from "@/lib/admin-module-status"

type ModulePlaceholderItem = {
  title: string
  description: string
}

export function AdminModulePlaceholderPage({
  title,
  description,
  state = "pending",
  percent = 20,
  note,
  scopes,
}: {
  title: string
  description: string
  state?: ConnectionState
  percent?: number
  note?: string
  scopes: ModulePlaceholderItem[]
}) {
  const fallbackNote =
    "Pendiente de endpoint productivo por Gateway Admin. No se muestran datos simulados."

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={title}
        description={description}
        state={state}
        percent={percent}
        note={note ?? fallbackNote}
      />

      <Card className="rounded-[1.5rem]">
        <CardHeader>
          <div className="mb-4 flex size-12 items-center justify-center rounded-full border bg-background">
            <IconPlugConnected className="size-6 text-primary" />
          </div>
          <CardTitle>Conexión pendiente</CardTitle>
          <CardDescription className="max-w-3xl leading-6">
            Esta vista queda preparada para operar con datos reales cuando el Gateway Admin
            publique el contrato correspondiente. Los accesos, permisos y acciones se mantienen
            separados para conectar el microservicio sin reescribir la pantalla.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {scopes.map((scope, index) => {
          const Icon = index === 0 ? IconDatabase : index === 1 ? IconActivity : IconShieldCheck

          return (
            <Card key={scope.title} className="rounded-[1.5rem]">
              <CardHeader>
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border bg-background">
                  <Icon className="size-6 text-primary" />
                </div>
                <CardTitle>{scope.title}</CardTitle>
                <CardDescription className="leading-6">{scope.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Estado: pendiente</CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
