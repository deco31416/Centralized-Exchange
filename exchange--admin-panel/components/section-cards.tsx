'use client'

import { IconShieldCheck, IconTrendingDown, IconTrendingUp, IconUsers } from "@tabler/icons-react"
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards() {
  const { stats, loading } = useDashboardStats()
  const formatStat = (value: number | null | undefined) =>
    typeof value === 'number' ? value.toLocaleString() : '—'
  const activeConnected = stats?.connection?.activeUsers === 'connected'
  const pendingConnected = stats?.connection?.pendingUsers === 'connected'

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card min-h-[15rem] border bg-card/90">
            <CardHeader>
              <CardDescription>Cargando...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                <div className="animate-pulse bg-muted h-8 w-24 rounded"></div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card min-h-[15rem] border bg-card/90">
        <CardHeader>
          <CardDescription>Total usuarios</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {stats?.totalUsers?.toLocaleString() || '0'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="rounded-full">
              <IconUsers />
              Cuentas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Usuarios registrados <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total de usuarios en la plataforma
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card min-h-[15rem] border bg-card/90">
        <CardHeader>
          <CardDescription>Usuarios activos</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {formatStat(stats?.activeUsers)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <IconTrendingUp />
              {activeConnected ? 'Online' : 'Pendiente'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Usuarios verificados
          </div>
          <div className="text-muted-foreground">
            Con email verificado y cuenta activa
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card min-h-[15rem] border bg-card/90">
        <CardHeader>
          <CardDescription>Administradores</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {stats?.totalAdmins?.toLocaleString() || '0'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="rounded-full bg-primary/10 text-primary">
              <IconShieldCheck />
              Staff
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Equipo administrativo
          </div>
          <div className="text-muted-foreground">
            Usuarios con roles de administración
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card min-h-[15rem] border bg-card/90">
        <CardHeader>
          <CardDescription>Pendientes</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {formatStat(stats?.pendingUsers)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <IconTrendingDown />
              {pendingConnected ? 'Verificación' : 'Pendiente'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Verificación KYC
          </div>
          <div className="text-muted-foreground">
            Cuentas pendientes de activación
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
