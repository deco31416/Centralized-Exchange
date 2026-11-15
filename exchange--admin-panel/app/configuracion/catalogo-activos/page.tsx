"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageConnectionHeader } from '@/components/page-connection-header'
import { IconSearch, IconToggleLeft, IconToggleRight, IconRefresh } from '@tabler/icons-react'
import { useState, useEffect, useCallback } from 'react'

interface CatalogAsset {
  code: string
  name: string
  type: string
  category: string
  enabled: boolean
  isVisibleInFrontend: boolean
  canBuy: boolean
  canSell: boolean
  canWithdraw: boolean
  canConvert: boolean
  displayOrder: number
  badge?: string
  rolloutPhase: 'mvp' | 'phase_2' | 'blocked'
  paymentMethods: string[]
}

type ToggleField = 'isVisibleInFrontend' | 'enabled' | 'canBuy' | 'canSell' | 'canWithdraw' | 'canConvert'

const FIELD_LABELS: Record<ToggleField, string> = {
  isVisibleInFrontend: 'Frontend',
  enabled: 'Activo',
  canBuy: 'Comprar',
  canSell: 'Vender',
  canWithdraw: 'Retirar',
  canConvert: 'Convertir',
}

export default function CatalogoActivosPage() {
  const [assets, setAssets] = useState<CatalogAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/catalog/admin/assets')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setAssets(data))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = async (code: string, field: ToggleField, current: boolean) => {
    setSaving(`${code}-${field}`)
    const updated = !current
    setAssets((prev) =>
      prev.map((a) => a.code === code ? { ...a, [field]: updated } : a)
    )
    try {
      const r = await fetch(`/api/catalog/admin/assets/${code}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ [field]: updated }),
      })
      if (!r.ok) throw new Error()
    } catch {
      // revertir en caso de error
      setAssets((prev) =>
        prev.map((a) => a.code === code ? { ...a, [field]: current } : a)
      )
    } finally {
      setSaving(null)
    }
  }

  const filtered = assets.filter((a) =>
    `${a.code} ${a.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalVisible = assets.filter((a) => a.isVisibleInFrontend && a.enabled).length
  const totalEnabled = assets.filter((a) => a.enabled).length
  const mvpCount = assets.filter((a) => a.rolloutPhase === 'mvp').length
  const phase2Count = assets.filter((a) => a.rolloutPhase === 'phase_2').length

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Catálogo de activos"
        description="Gestión de activos disponibles en el exchange y control de operaciones por activo."
        state="partial"
        percent={75}
        note="Lee y actualiza activos por asset-registry vía Gateway Admin; falta completar validaciones avanzadas y auditoría de cambios."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Activos en frontend</CardDescription>
            <CardTitle className="text-3xl">{totalVisible}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total habilitados</CardDescription>
            <CardTitle className="text-3xl">{totalEnabled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Fase MVP</CardDescription>
            <CardTitle className="text-3xl">{mvpCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Fase 2</CardDescription>
            <CardTitle className="text-3xl">{phase2Count}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Activos del Catálogo</CardTitle>
              <CardDescription>Activa o desactiva visibilidad y operaciones por activo</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar activo..."
                  className="pl-8 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={load} disabled={loading}>
                <IconRefresh className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Cargando activos...</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Activo</th>
                    <th className="text-left p-2 font-medium">Tipo</th>
                    <th className="text-left p-2 font-medium">Fase</th>
                    {(Object.keys(FIELD_LABELS) as ToggleField[]).map((f) => (
                      <th key={f} className="text-center p-2 font-medium">{FIELD_LABELS[f]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => (
                    <tr key={asset.code} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{asset.code}</span>
                          <span className="text-muted-foreground text-xs">{asset.name}</span>
                          {asset.badge && (
                            <Badge variant="outline" className="text-xs">{asset.badge}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{asset.category}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={asset.rolloutPhase === 'mvp' ? 'default' : 'outline'}>
                          {asset.rolloutPhase === 'mvp' ? 'MVP' : asset.rolloutPhase === 'phase_2' ? 'Fase 2' : 'Bloqueado'}
                        </Badge>
                      </td>
                      {(Object.keys(FIELD_LABELS) as ToggleField[]).map((field) => {
                        const val = asset[field] as boolean
                        const key = `${asset.code}-${field}`
                        const isSaving = saving === key
                        return (
                          <td key={field} className="p-2 text-center">
                            <button
                              onClick={() => toggle(asset.code, field, val)}
                              disabled={isSaving}
                              className="inline-flex items-center justify-center disabled:opacity-40"
                              title={val ? 'Desactivar' : 'Activar'}
                            >
                              {val
                                ? <IconToggleRight className="h-6 w-6 text-green-500" />
                                : <IconToggleLeft className="h-6 w-6 text-muted-foreground" />
                              }
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3 + Object.keys(FIELD_LABELS).length} className="p-6 text-center text-muted-foreground">
                        No se encontraron activos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
