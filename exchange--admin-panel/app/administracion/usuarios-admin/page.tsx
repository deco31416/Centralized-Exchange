"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconPlus, IconSearch, IconShield, IconUser } from "@tabler/icons-react"

interface AdminUser {
  id: string
  email: string
  username?: string
  status: string
  roles: string[]
  created_at: string
  email_verified?: boolean
  sms_otp_enabled?: boolean
  totp_enabled?: boolean
}

export default function UsuariosAdminPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await fetch('/api/admins?limit=100')
        if (!res.ok) throw new Error('Error al cargar admins')
        const data = await res.json()
        setAdmins(data.admins || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchAdmins()
  }, [])

  const users = useMemo(() => admins.map((a) => ({
    id: a.id.substring(0, 8).toUpperCase(),
    email: a.email,
    nombre: a.username || a.email.split('@')[0],
    rol: a.roles?.[0] || 'sin rol',
    status: a.status === 'active' ? 'activo' : 'inactivo',
    ultimo_acceso: a.created_at ? new Date(a.created_at).toLocaleString('es-MX') : '—',
    twofa: a.totp_enabled || a.sms_otp_enabled || false,
  })), [admins])

  const totalActivos = users.filter(u => u.status === 'activo').length
  const totalInactivos = users.filter(u => u.status !== 'activo').length
  const totalCon2fa = users.filter(u => u.twofa).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageConnectionHeader
          title="Usuarios Administrativos"
          description="Gestión de cuentas administrativas del sistema"
          state="partial"
          percent={75}
          note="Listado conectado por auth-admin; crear, editar y eliminar quedan pendientes."
        />
        <Button disabled title="Pendiente: endpoint de creación administrativa">
          <IconPlus className="h-4 w-4 mr-2" />
          Crear admin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : users.length}</div>
            <p className="text-xs text-muted-foreground">Desde auth-admin API</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <IconShield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loading ? '…' : totalActivos}</div>
            <p className="text-xs text-muted-foreground">{users.length > 0 ? `${((totalActivos / users.length) * 100).toFixed(1)}% del total` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <IconShield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{loading ? '…' : totalInactivos}</div>
            <p className="text-xs text-muted-foreground">{users.length > 0 ? `${((totalInactivos / users.length) * 100).toFixed(1)}% del total` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con 2FA</CardTitle>
            <IconShield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{loading ? '…' : totalCon2fa}</div>
            <p className="text-xs text-muted-foreground">{users.length > 0 ? `${((totalCon2fa / users.length) * 100).toFixed(1)}% del total` : '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Email, nombre..." className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="soporte">Soporte</SelectItem>
                  <SelectItem value="finanzas">Finanzas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>2FA</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="enabled">Habilitado</SelectItem>
                  <SelectItem value="disabled">Deshabilitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios Administrativos</CardTitle>
          <CardDescription>
            {loading ? 'Cargando...' : error ? error : `${users.length} usuarios registrados en el sistema`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Rol</th>
                  <th className="text-left p-3 font-medium">2FA</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Último Acceso</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">{user.id}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.nombre}</td>
                    <td className="p-3">
                      <Badge variant="outline">{user.rol}</Badge>
                    </td>
                    <td className="p-3">
                      {user.twofa ? (
                        <Badge className="bg-green-500">Habilitado</Badge>
                      ) : (
                        <Badge variant="destructive">Deshabilitado</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={user.status === "activo" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{user.ultimo_acceso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
