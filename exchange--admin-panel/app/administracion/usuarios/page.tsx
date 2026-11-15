'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useUsers } from '@/hooks/use-users'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')

  const { data, loading, error } = useUsers({
    page,
    limit: 20,
    search,
    status: statusFilter || undefined,
    role: roleFilter || undefined,
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: { className: 'bg-green-500/10 text-green-500', label: 'Activo' },
      PENDING_VERIFICATION: { className: 'bg-yellow-500/10 text-yellow-500', label: 'Pendiente' },
      LOCKED: { className: 'bg-red-500/10 text-red-500', label: 'Bloqueado' },
      DELETED: { className: 'bg-gray-500/10 text-gray-500', label: 'Eliminado' },
    }
    const config = variants[status] || { className: '', label: status }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <AuthGuard requiredRoles={['admin', 'super_admin', 'operator']}>
      <DashboardLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-2">
              Administra todos los usuarios de la plataforma
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <Input
                placeholder="Buscar por email o username..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1) // Reset page on search
                }}
                className="max-w-md"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">Pendientes</SelectItem>
                  <SelectItem value="LOCKED">Bloqueados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => window.location.href = '/administracion/usuarios/nuevo'}>
              + Crear Usuario
            </Button>
          </div>

          {/* Tabla */}
          <div className="rounded-lg border bg-card">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Cargando usuarios...</p>
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
                      <TableHead>Estado</TableHead>
                      <TableHead>MFA</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.username || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles?.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {user.totp_enabled ? (
                            <Badge className="bg-blue-500/10 text-blue-500">TOTP</Badge>
                          ) : user.sms_otp_enabled ? (
                            <Badge className="bg-purple-500/10 text-purple-500">SMS</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.location.href = `/administracion/usuarios/${user.id}`
                            }
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginación */}
                <div className="flex items-center justify-between border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * 20) + 1} - {Math.min(page * 20, data?.total || 0)} de {data?.total || 0} usuarios
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
