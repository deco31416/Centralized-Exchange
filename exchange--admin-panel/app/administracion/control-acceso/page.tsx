"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconShield, IconLock } from "@tabler/icons-react"

interface RoleFromApi {
  name: string
  hierarchy: number
  permissions: string[]
}

export default function ControlAccesoPage() {
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

  const roles = useMemo(() => rolesData.map(r =>
    r.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ), [rolesData])

  const { matriz, modules } = useMemo(() => {
    const moduleSet = new Set<string>()
    rolesData.forEach(r => r.permissions.forEach(p => {
      const [mod, action] = p.split(':')
      moduleSet.add(`${mod}:${action}`)
    }))
    const modules = Array.from(moduleSet).sort()
    const matriz = modules.map(perm => {
      const row: Record<string, any> = {
        modulo: perm.replace(/:/, ' — ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      }
      rolesData.forEach(r => {
        const label = r.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        row[label] = r.permissions.includes(perm)
      })
      return row
    })
    return { matriz, modules }
  }, [rolesData])

  const allPermissions = useMemo(() => {
    const set = new Set<string>()
    rolesData.forEach(r => r.permissions.forEach(p => set.add(p)))
    return set.size
  }, [rolesData])

  return (
    <div className="space-y-6">
      <PageConnectionHeader
        title="Control de Acceso (RBAC)"
        description="Matriz de control de acceso basado en roles"
        state="connected"
        percent={90}
        note="Matriz calculada desde roles y permisos consultados por Gateway Admin."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles Activos</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : roles.length}</div>
            <p className="text-xs text-muted-foreground">Con permisos asignados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos</CardTitle>
            <IconLock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : modules.length}</div>
            <p className="text-xs text-muted-foreground">Módulos controlados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permisos</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : allPermissions}</div>
            <p className="text-xs text-muted-foreground">Permisos granulares</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de Acceso RBAC</CardTitle>
          <CardDescription>
            Vista consolidada de permisos por rol y módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium min-w-[200px]">Módulo / Acción</th>
                  {roles.map((rol) => (
                    <th key={rol} className="text-center p-3 font-medium">
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{rol}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matriz.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{row.modulo}</td>
                    {roles.map((rol) => (
                      <td key={rol} className="p-3 text-center">
                        {(row as any)[rol] ? (
                          <Badge className="bg-green-500">✓</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">✗</Badge>
                        )}
                      </td>
                    ))}
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
