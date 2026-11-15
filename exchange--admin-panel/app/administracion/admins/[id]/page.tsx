'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useAdminDetail, useAdminActivity } from '@/hooks/use-users'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconUser,
  IconMail,
  IconPhone,
  IconShield,
  IconClock,
  IconActivity,
  IconKey,
  IconAlertTriangle,
  IconCircleCheck,
  IconArrowLeft,
} from '@tabler/icons-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: admin, loading, error } = useAdminDetail(id)
  const { data: activities, loading: loadingActivity } = useAdminActivity(id, 10)

  if (error) {
    return (
      <AuthGuard requiredRoles={['admin', 'super_admin']}>
        <DashboardLayout>
          <div className="p-6">
            <div className="text-center py-12">
              <IconAlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error al cargar administrador</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.back()}>
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRoles={['admin', 'super_admin']}>
      <DashboardLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <IconArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {loading ? <Skeleton className="h-9 w-64" /> : 'Detalle de Administrador'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {loading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    admin?.email || 'Información del usuario administrativo'
                  )}
                </p>
              </div>
            </div>
            {!loading && admin && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <IconKey className="h-4 w-4 mr-2" />
                  Gestionar Roles
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <IconAlertTriangle className="h-4 w-4 mr-2" />
                  Desactivar
                </Button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUser className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </>
                ) : admin ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">ID</span>
                      <span className="text-sm font-mono">{admin.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-medium">{admin.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Username</span>
                      <span className="text-sm">{admin.username || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Nombre</span>
                      <span className="text-sm">
                        {admin.first_name && admin.last_name
                          ? `${admin.first_name} ${admin.last_name}`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Teléfono</span>
                      <span className="text-sm">{admin.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Organización</span>
                      <span className="text-sm font-mono">{admin.org_id || '-'}</span>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Roles y Permisos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconShield className="h-5 w-5" />
                  Roles y Permisos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </>
                ) : admin ? (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-2">Roles Asignados</span>
                      <div className="flex gap-2 flex-wrap">
                        {admin.roles && admin.roles.length > 0 ? (
                          admin.roles.map((role) => (
                            <Badge
                              key={role}
                              className={
                                role === 'super_admin'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-blue-500/10 text-blue-500'
                              }
                            >
                              <IconShield className="h-3 w-3 mr-1" />
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin roles asignados</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-2">Permisos</span>
                      <span className="text-sm">
                        {admin.permissions
                          ? `${admin.permissions.length} permisos activos`
                          : 'Sin permisos'}
                      </span>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Estado de Seguridad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconShield className="h-5 w-5" />
                  Estado de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </>
                ) : admin ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado</span>
                      <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                        {admin.status || 'activo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Email Verificado</span>
                      {admin.email_verified ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          <IconCircleCheck className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-500">
                          <IconAlertTriangle className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">MFA (TOTP)</span>
                      {admin.totp_enabled ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          <IconCircleCheck className="h-3 w-3 mr-1" />
                          Habilitado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-500">
                          <IconAlertTriangle className="h-3 w-3 mr-1" />
                          Deshabilitado
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">SMS OTP</span>
                      {admin.sms_otp_enabled ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          <IconCircleCheck className="h-3 w-3 mr-1" />
                          Habilitado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Deshabilitado</Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Intentos Fallidos</span>
                      <span className="text-sm font-medium">
                        {admin.failed_login_attempts || 0}
                      </span>
                    </div>
                    {admin.locked_until && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Bloqueado Hasta</span>
                        <Badge variant="destructive">
                          {new Date(admin.locked_until).toLocaleString('es-ES')}
                        </Badge>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Estadísticas de Acceso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconClock className="h-5 w-5" />
                  Estadísticas de Acceso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    ))}
                  </>
                ) : admin ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cuenta Creada</span>
                      <span className="text-sm">
                        {new Date(admin.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Último Acceso</span>
                      <span className="text-sm">
                        {admin.last_login
                          ? new Date(admin.last_login).toLocaleString('es-ES')
                          : 'Nunca'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Inicios de Sesión</span>
                      <span className="text-sm font-medium">{admin.login_count || 0}</span>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas 10 acciones realizadas por este administrador</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActivity ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg border">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <IconActivity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{new Date(activity.timestamp).toLocaleString('es-ES')}</span>
                          {activity.ip_address && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{activity.ip_address}</span>
                            </>
                          )}
                          {activity.target && (
                            <>
                              <span>•</span>
                              <span className="truncate">{activity.target}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <IconActivity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay actividad reciente registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
