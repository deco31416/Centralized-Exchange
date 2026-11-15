"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconClock, IconMapPin, IconDeviceDesktop, IconX } from "@tabler/icons-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAdminSessions } from "@/hooks/use-sessions"

export default function SesionesActivasPage() {
  return (
    <AuthGuard requiredRoles={['admin', 'super_admin']}>
      <SesionesActivasContent />
    </AuthGuard>
  )
}

function SesionesActivasContent() {
  const { sessions, loading, revokeSession } = useAdminSessions()

  const activeSessions = sessions.filter(s => s.status === 'active' || !s.status)
  const expiredSessions = sessions.filter(s => s.status === 'expired' || s.status === 'revoked')

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
    } catch { return dateStr }
  }

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Hace instantes'
      if (mins < 60) return `Hace ${mins} min`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `Hace ${hrs}h`
      return `Hace ${Math.floor(hrs / 24)}d`
    } catch { return dateStr }
  }

  const parseUserAgent = (ua?: string) => {
    if (!ua) return 'Desconocido'
    if (ua.length > 60) return ua.substring(0, 57) + '...'
    return ua
  }

  return (
    <div className="space-y-6">
      <PageConnectionHeader
        title="Sesiones Activas"
        description="Monitoreo en tiempo real de sesiones administrativas"
        state="connected"
        percent={100}
        note="Consulta y revocación conectadas por auth-admin."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <IconClock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loading ? '—' : activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">En este momento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caducadas</CardTitle>
            <IconClock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{loading ? '—' : expiredSessions.length}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : sessions.length}</div>
            <p className="text-xs text-muted-foreground">Registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
            <IconMapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : new Set(sessions.map(s => s.location).filter(Boolean)).size}</div>
            <p className="text-xs text-muted-foreground">Ciudades únicas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones Administrativas</CardTitle>
          <CardDescription>{loading ? 'Cargando...' : `${sessions.length} sesiones registradas`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">ID Sesión</th>
                  <th className="text-left p-3 font-medium">Administrador</th>
                  <th className="text-left p-3 font-medium">Inicio</th>
                  <th className="text-left p-3 font-medium">Última Actividad</th>
                  <th className="text-left p-3 font-medium">IP / Ubicación</th>
                  <th className="text-left p-3 font-medium">Dispositivo</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((ses) => {
                  const isActive = ses.status === 'active' || !ses.status
                  return (
                    <tr key={ses.sessionId} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{ses.sessionId?.substring(0, 8) || '—'}</td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-medium">{ses.email || ses.userId}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{formatDate(ses.createdAt)}</td>
                      <td className="p-3 text-sm">{getRelativeTime(ses.lastActivity)}</td>
                      <td className="p-3">
                        <div className="flex items-start gap-1">
                          <IconMapPin className="h-3 w-3 mt-0.5" />
                          <div>
                            <p className="font-mono text-xs">{ses.ip || '—'}</p>
                            <p className="text-xs text-muted-foreground">{ses.location || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs">
                          <IconDeviceDesktop className="h-3 w-3" />
                          {parseUserAgent(ses.userAgent || ses.device)}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? 'activa' : (ses.status || 'caducada')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => revokeSession(ses.sessionId)}
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
