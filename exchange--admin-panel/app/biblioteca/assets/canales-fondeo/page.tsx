"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  IconBuildingBank,
  IconPlus,
  IconPencil,
  IconTrash,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconCurrencyDollar,
  IconPhone,
  IconLoader2,
} from "@tabler/icons-react"
import {
  getAllAssetsForAdmin,
  updateFundingChannels,
  toggleFundingChannel,
  removeFundingChannel,
  type CatalogAsset,
  type FundingChannel,
} from "@/lib/api/catalogApi"

const CHANNEL_TYPES = [
  { value: "bank_transfer", label: "Transferencia Bancaria" },
  { value: "mobile_payment", label: "Pago Móvil" },
  { value: "cash_reference", label: "Referencia de Efectivo" },
  { value: "internal_credit", label: "Crédito Interno" },
]

const ENVIRONMENTS = [
  { value: "development", label: "Desarrollo" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Producción" },
]

const EMPTY_CHANNEL: FundingChannel = {
  type: "bank_transfer",
  provider: "",
  bankName: "",
  accountType: "",
  accountNumber: "",
  routingNumber: "",
  phone: "",
  documentId: "",
  bankCode: "",
  alias: "",
  holderName: "DECO EXCHANGE Demo",
  currency: "",
  country: "",
  instructions: "",
  isTest: true,
  environment: "development",
  enabled: true,
}

function typeIcon(type: string) {
  if (type === "mobile_payment") return <IconPhone className="size-3.5" />
  if (type === "cash_reference") return <IconCurrencyDollar className="size-3.5" />
  return <IconBuildingBank className="size-3.5" />
}

function typeLabel(type: string) {
  return CHANNEL_TYPES.find((t) => t.value === type)?.label ?? type
}

export default function CanalesFondeoPage() {
  const [assets, setAssets] = useState<CatalogAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null) // asset code being saved

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<CatalogAsset | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null) // null = adding new
  const [formData, setFormData] = useState<FundingChannel>(EMPTY_CHANNEL)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSaving, setFormSaving] = useState(false)

  const loadAssets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const all = await getAllAssetsForAdmin()
      // Solo fiat — los funding channels son exclusivos de monedas fiat
      setAssets(all.filter((a) => a.type === "fiat"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando activos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAssets() }, [loadAssets])

  // ── Handlers ──────────────────────────────────────────────────────────

  function openAddModal(asset: CatalogAsset) {
    setEditingAsset(asset)
    setEditingIndex(null)
    setFormData({ ...EMPTY_CHANNEL, currency: asset.code, country: "" })
    setFormError(null)
    setModalOpen(true)
  }

  function openEditModal(asset: CatalogAsset, idx: number) {
    setEditingAsset(asset)
    setEditingIndex(idx)
    setFormData({ ...(asset.fundingChannels?.[idx] ?? EMPTY_CHANNEL) })
    setFormError(null)
    setModalOpen(true)
  }

  async function handleToggleChannel(asset: CatalogAsset, idx: number, enabled: boolean) {
    setSaving(asset.code)
    try {
      const updated = await toggleFundingChannel(asset, idx, enabled)
      setAssets((prev) => prev.map((a) => (a.code === asset.code ? updated : a)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar canal")
    } finally {
      setSaving(null)
    }
  }

  async function handleRemoveChannel(asset: CatalogAsset, idx: number) {
    if (!confirm(`¿Eliminar canal "${asset.fundingChannels?.[idx]?.provider}"?`)) return
    setSaving(asset.code)
    try {
      const updated = await removeFundingChannel(asset, idx)
      setAssets((prev) => prev.map((a) => (a.code === asset.code ? updated : a)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar canal")
    } finally {
      setSaving(null)
    }
  }

  async function handleSaveModal() {
    if (!editingAsset) return
    if (!formData.provider.trim()) { setFormError("Provider es obligatorio"); return }
    if (!formData.holderName.trim()) { setFormError("holderName es obligatorio"); return }
    if (!formData.currency.trim()) { setFormError("Currency es obligatorio"); return }

    setFormError(null)
    setFormSaving(true)
    try {
      const channels = [...(editingAsset.fundingChannels ?? [])]
      if (editingIndex !== null) {
        channels[editingIndex] = formData
      } else {
        channels.push(formData)
      }
      const updated = await updateFundingChannels(editingAsset.code, channels)
      setAssets((prev) => prev.map((a) => (a.code === editingAsset.code ? updated : a)))
      setModalOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error guardando canal")
    } finally {
      setFormSaving(false)
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  const totalFiat = assets.length
  const withChannels = assets.filter((a) => (a.fundingChannels?.length ?? 0) > 0).length
  const totalChannels = assets.reduce((sum, a) => sum + (a.fundingChannels?.length ?? 0), 0)
  const testChannels = assets.reduce(
    (sum, a) => sum + (a.fundingChannels?.filter((c) => c.isTest).length ?? 0),
    0,
  )

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageConnectionHeader
          title="Canales de fondeo"
          description="Gestión de canales de recarga por moneda fiat."
          state="partial"
          percent={80}
          note="Lee y actualiza fundingChannels desde asset-registry por Gateway Admin."
        />
        <Button variant="outline" size="sm" onClick={loadAssets} disabled={loading}>
          <IconRefresh className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Recargar
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 @xl/page:grid-cols-4">
        {[
          { label: "Monedas fiat", value: totalFiat, icon: <IconCurrencyDollar className="size-4" /> },
          { label: "Con canales", value: withChannels, icon: <IconCheck className="size-4" /> },
          { label: "Total canales", value: totalChannels, icon: <IconBuildingBank className="size-4" /> },
          { label: "Demo / test", value: testChannels, icon: <IconAlertCircle className="size-4" /> },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <div className="rounded-md bg-muted p-2 text-muted-foreground">{s.icon}</div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Error */}
      {error && (
        <Card className="flex items-center gap-3 border-destructive p-4 text-destructive">
          <IconAlertCircle className="size-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Asset list */}
      {!loading && assets.map((asset) => (
        <Card key={asset.code} className="overflow-hidden">
          {/* Asset header */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
            <div className="flex items-center gap-3">
              {asset.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.iconUrl} alt={asset.code} className="size-7 rounded-full object-contain" />
              )}
              <div>
                <span className="font-semibold">{asset.code}</span>
                <span className="ml-2 text-sm text-muted-foreground">{asset.name}</span>
              </div>
              {!asset.isVisibleInFrontend && (
                <Badge variant="outline" className="text-xs">oculto</Badge>
              )}
              {asset.rolloutPhase && asset.rolloutPhase !== "mvp" && (
                <Badge variant="secondary" className="text-xs">{asset.rolloutPhase}</Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openAddModal(asset)}
              disabled={saving === asset.code}
            >
              <IconPlus className="size-4 mr-1" />
              Agregar canal
            </Button>
          </div>

          {/* Channels */}
          <div className="divide-y">
            {(asset.fundingChannels?.length ?? 0) === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground italic">Sin canales configurados.</p>
            ) : (
              asset.fundingChannels!.map((ch, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-2 px-5 py-4 @xl/page:flex-row @xl/page:items-start ${
                    ch.enabled === false ? "opacity-50" : ""
                  }`}
                >
                  {/* Type badge + provider */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        {typeIcon(ch.type)}
                        {typeLabel(ch.type)}
                      </Badge>
                      <span className="font-medium text-sm">{ch.provider}</span>
                      {ch.bankName && (
                        <span className="text-xs text-muted-foreground">· {ch.bankName}</span>
                      )}
                      {ch.isTest && (
                        <Badge variant="secondary" className="text-xs">DEMO</Badge>
                      )}
                      {ch.environment !== "production" && (
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                          {ch.environment}
                        </Badge>
                      )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-muted-foreground mt-1 @2xl/page:grid-cols-3">
                      {ch.accountType && <span>Tipo: <strong className="text-foreground">{ch.accountType}</strong></span>}
                      {ch.accountNumber && <span>Cuenta: <strong className="text-foreground">{ch.accountNumber}</strong></span>}
                      {ch.routingNumber && <span>Routing/IBAN: <strong className="text-foreground">{ch.routingNumber}</strong></span>}
                      {ch.phone && <span>Teléfono: <strong className="text-foreground">{ch.phone}</strong></span>}
                      {ch.documentId && <span>Documento: <strong className="text-foreground">{ch.documentId}</strong></span>}
                      {ch.bankCode && <span>Cód. Banco: <strong className="text-foreground">{ch.bankCode}</strong></span>}
                      {ch.alias && <span>Alias: <strong className="text-foreground">{ch.alias}</strong></span>}
                      {ch.holderName && <span>Titular: <strong className="text-foreground">{ch.holderName}</strong></span>}
                      {ch.country && <span>País: <strong className="text-foreground">{ch.country}</strong></span>}
                    </div>

                    {ch.instructions && (
                      <p className="mt-1 text-xs text-muted-foreground italic">{ch.instructions}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ch.enabled !== false}
                        onCheckedChange={(v) => handleToggleChannel(asset, idx, v)}
                        disabled={saving === asset.code}
                        aria-label="Activar canal"
                      />
                      <span className="text-xs text-muted-foreground">
                        {ch.enabled !== false ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(asset, idx)}
                      disabled={saving === asset.code}
                    >
                      <IconPencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveChannel(asset, idx)}
                      disabled={saving === asset.code}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ))}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Editar canal de fondeo" : "Agregar canal de fondeo"}
              {editingAsset && <span className="ml-2 font-normal text-muted-foreground text-sm">— {editingAsset.code}</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Type */}
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Tipo *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANNEL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider */}
            <div className="flex flex-col gap-1.5">
              <Label>Provider *</Label>
              <Input value={formData.provider} onChange={(e) => setFormData((p) => ({ ...p, provider: e.target.value }))} placeholder="Ej: BBVA, Nequi, OXXO" />
            </div>

            {/* Bank name */}
            <div className="flex flex-col gap-1.5">
              <Label>Banco</Label>
              <Input value={formData.bankName ?? ""} onChange={(e) => setFormData((p) => ({ ...p, bankName: e.target.value }))} placeholder="Ej: BBVA México" />
            </div>

            {/* Account type */}
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de cuenta</Label>
              <Input value={formData.accountType ?? ""} onChange={(e) => setFormData((p) => ({ ...p, accountType: e.target.value }))} placeholder="Ej: CLABE, IBAN, CBU" />
            </div>

            {/* Account number */}
            <div className="flex flex-col gap-1.5">
              <Label>Número de cuenta</Label>
              <Input value={formData.accountNumber ?? ""} onChange={(e) => setFormData((p) => ({ ...p, accountNumber: e.target.value }))} placeholder="Número de cuenta" />
            </div>

            {/* Routing */}
            <div className="flex flex-col gap-1.5">
              <Label>Routing / IBAN / CLABE</Label>
              <Input value={formData.routingNumber ?? ""} onChange={(e) => setFormData((p) => ({ ...p, routingNumber: e.target.value }))} placeholder="Routing number o IBAN" />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label>Teléfono</Label>
              <Input value={formData.phone ?? ""} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="Ej: 3001234567" />
            </div>

            {/* Document ID */}
            <div className="flex flex-col gap-1.5">
              <Label>Documento</Label>
              <Input value={formData.documentId ?? ""} onChange={(e) => setFormData((p) => ({ ...p, documentId: e.target.value }))} placeholder="Ej: V-12345678" />
            </div>

            {/* Bank code */}
            <div className="flex flex-col gap-1.5">
              <Label>Código de banco</Label>
              <Input value={formData.bankCode ?? ""} onChange={(e) => setFormData((p) => ({ ...p, bankCode: e.target.value }))} placeholder="Ej: 0102" />
            </div>

            {/* Alias */}
            <div className="flex flex-col gap-1.5">
              <Label>Alias</Label>
              <Input value={formData.alias ?? ""} onChange={(e) => setFormData((p) => ({ ...p, alias: e.target.value }))} placeholder="Ej: deco-exchange.demo" />
            </div>

            {/* Holder name */}
            <div className="flex flex-col gap-1.5">
              <Label>Titular *</Label>
              <Input value={formData.holderName} onChange={(e) => setFormData((p) => ({ ...p, holderName: e.target.value }))} placeholder="DECO EXCHANGE Demo" />
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-1.5">
              <Label>Moneda *</Label>
              <Input value={formData.currency} onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} placeholder="MXN" />
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <Label>País</Label>
              <Input value={formData.country} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value.toUpperCase() }))} placeholder="MX" />
            </div>

            {/* Environment */}
            <div className="flex flex-col gap-1.5">
              <Label>Entorno</Label>
              <Select value={formData.environment} onValueChange={(v) => setFormData((p) => ({ ...p, environment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Instructions */}
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Instrucciones</Label>
              <Input value={formData.instructions ?? ""} onChange={(e) => setFormData((p) => ({ ...p, instructions: e.target.value }))} placeholder="Instrucciones para el usuario" />
            </div>

            {/* isTest + enabled */}
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isTest}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isTest: v }))}
                id="isTest"
              />
              <Label htmlFor="isTest">Datos de prueba (isTest)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.enabled !== false}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, enabled: v }))}
                id="enabled"
              />
              <Label htmlFor="enabled">Canal activo</Label>
            </div>
          </div>

          {formError && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <IconAlertCircle className="size-4 shrink-0" />
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={formSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModal} disabled={formSaving}>
              {formSaving && <IconLoader2 className="size-4 mr-2 animate-spin" />}
              {editingIndex !== null ? "Guardar cambios" : "Agregar canal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
