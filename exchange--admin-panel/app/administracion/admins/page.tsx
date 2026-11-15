'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useAdmins } from '@/hooks/use-users'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const { data, loading, error } = useAdmins({ page, limit: 20 })

  return (
    <AuthGuard requiredRoles={['admin', 'super_admin']}>
      <DashboardLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Administradores</h1>
              <p className="text-muted-foreground mt-2">
                Panel de usuarios administrativos
              </p>
            </div>
            <Button onClick={() => router.push('/administracion/admins/nuevo')}>
              + Crear Admin
            </Button>
          </div>

          {/* Tabla */}
          <div className="rounded-lg border bg-card">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {/* Header Skeleton */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                  
                  {/* Table Skeletons */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">Error: {error}</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>MFA</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.admins.map((admin) => (
                      <TableRow 
                        key={admin.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => router.push(`/administracion/admins/${admin.id}`)}
                      >
                        <TableCell className="font-medium">{admin.email}</TableCell>
                        <TableCell>{admin.username || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {admin.roles?.map((role) => (
                              <Badge key={role} className="bg-blue-500/10 text-blue-500">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {admin.totp_enabled ? (
                            <Badge className="bg-green-500/10 text-green-500">✓ TOTP</Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-500">⚠ Sin MFA</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(admin.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/administracion/admins/${admin.id}`)
                            }}
                          >
                            Ver Detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginación */}
                <div className="flex items-center justify-between border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    {data?.admins.length || 0} administradores
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= (data?.pages || 1)}
                      onClick={() => setPage(page + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
