"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconKey, IconPlus, IconShield } from "@tabler/icons-react"

interface RoleFromApi {
  name: string
  hierarchy: number
  permissions: string[]
}

export default function RolesPermisosPage() {
  const [rolesData, setRolesData] = useState<RoleFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch('/api/roles/')
        if (!res.ok) throw new Error('Error al cargar roles')
        const data = await res.json()
        setRolesData(data.roles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  const roles = useMemo(() => rolesData.map((r) => {
    const nivel = r.hierarchy <= 1 ? 'critical' : r.hierarchy <= 2 ? 'high' : r.hierarchy <= 3 ? 'medium' : 'low'
    return {
      id: r.name,
      nombre: r.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      descripcion: `Jerarquía: ${r.hierarchy}`,
      permisos: r.permissions.length,
      nivel,
    }
  }), [rolesData])

  const allPermissions = useMemo(() => {
    const set = new Set<string>()
    rolesData.forEach(r => r.permissions.forEach(p => set.add(p)))
    return set.size
  }, [rolesData])

  const categorias = useMemo(() => {
    const catMap: Record<string, string[]> = {}
    rolesData.forEach(r => {
      r.permissions.forEach(p => {
        const [module] = p.split(':')
        if (!catMap[module]) catMap[module] = []
        if (!catMap[module].includes(p)) catMap[module].push(p)
      })
    })
    return Object.entries(catMap).map(([nombre, permisos]) => ({
      nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
      permisos,
    }))
  }, [rolesData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageConnectionHeader
          title="Roles y Permisos"
          description="Definición de roles y gestión de permisos granulares"
          state="partial"
          percent={80}
          note="Consulta conectada por auth-admin; creación y edición quedan pendientes."
        />
        <Button disabled title="Pendiente: endpoint de administración de roles">
          <IconPlus className="h-4 w-4 mr-2" />
          Crear rol
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <IconKey className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : roles.length}</div>
            <p className="text-xs text-muted-foreground">Roles activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permisos Totales</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : allPermissions}</div>
            <p className="text-xs text-muted-foreground">Permisos únicos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Asignados</CardTitle>
            <IconKey className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Requiere endpoint admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles Críticos</CardTitle>
            <IconShield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loading ? '…' : roles.filter(r => r.nivel === 'critical').length}</div>
            <p className="text-xs text-muted-foreground">Requieren 2FA</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles Definidos</CardTitle>
          <CardDescription>{loading ? 'Cargando...' : error ? error : `${roles.length} roles configurados en el sistema`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Descripción</th>
                  <th className="text-left p-3 font-medium">Permisos</th>
                  <th className="text-left p-3 font-medium">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((rol) => (
                  <tr key={rol.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-semibold">{rol.nombre}</td>
                    <td className="p-3 text-sm text-muted-foreground">{rol.descripcion}</td>
                    <td className="p-3">
                      <Badge variant="outline">{rol.permisos} permisos</Badge>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={rol.nivel === "critical" ? "destructive" : rol.nivel === "high" ? "default" : "secondary"}
                      >
                        {rol.nivel}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permisos por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos por Categoría</CardTitle>
          <CardDescription>Visualización de permisos disponibles organizados por módulo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorias.map((cat, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <IconShield className="h-4 w-4 text-primary" />
                  {cat.nombre}
                  <Badge variant="outline" className="ml-auto">{cat.permisos.length} permisos</Badge>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.permisos.map((perm, j) => (
                    <Badge key={j} variant="secondary" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
