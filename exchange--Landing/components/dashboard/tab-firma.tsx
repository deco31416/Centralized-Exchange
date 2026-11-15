"use client"

import React, { useState, useEffect } from "react"
import {
  KeyRound, RefreshCw, AlertTriangle, CheckCircle,
  Lock, ChevronUp, ChevronDown, RotateCcw,
  Zap, ZapOff, Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import PinInput from "@/components/dashboard/pin-input"
import type { SignatureStatus, DynamicKeyStatus } from "@/components/dashboard/types"

export default function TabFirma() {
  const [status, setStatus] = useState<SignatureStatus | null>(null)
  const [dynStatus, setDynStatus] = useState<DynamicKeyStatus | null>(null)
  const [loadingSig, setLoadingSig] = useState(true)
  const [loadingDyn, setLoadingDyn] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Formulario PIN
  const [showPinForm, setShowPinForm] = useState(false)
  const [pinForm, setPinForm] = useState({ currentPin: "", newPin: "", newPinConfirm: "" })
  const [showPins, setShowPins] = useState({ current: false, new: false, confirm: false })
  const [savingPin, setSavingPin] = useState(false)
  const [pinMsg, setPinMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Clave dinámica
  const [togglingDyn, setTogglingDyn] = useState(false)
  const [dynMsg, setDynMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [showDynKey, setShowDynKey] = useState(false)
  const [dynKey, setDynKey] = useState<{ key: string; expiresAt: string } | null>(null)
  const [loadingDynKey, setLoadingDynKey] = useState(false)

  function loadSignature() {
    setLoadingSig(true)
    fetch("/api/signature/status", { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => setStatus(d))
      .catch(() => setError("No se pudo cargar el estado de firma"))
      .finally(() => setLoadingSig(false))
  }

  function loadDynamicKey() {
    setLoadingDyn(true)
    fetch("/api/dynamic-key/status", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setDynStatus(d) })
      .catch(() => {})
      .finally(() => setLoadingDyn(false))
  }

  useEffect(() => { loadSignature(); loadDynamicKey() }, [])

  const hasPIN = status?.hasSignature || status?.hasPIN

  async function handleSavePin() {
    setSavingPin(true)
    setPinMsg(null)
    try {
      const method = hasPIN ? "PUT" : "POST"
      const body = hasPIN
        ? { currentPin: pinForm.currentPin, newPin: pinForm.newPin, newPinConfirm: pinForm.newPinConfirm }
        : { pin: pinForm.newPin, pinConfirm: pinForm.newPinConfirm }

      const r = await fetch("/api/signature", {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (r.ok) {
        setPinMsg({ type: "ok", text: hasPIN ? "PIN actualizado correctamente" : "PIN creado correctamente" })
        setPinForm({ currentPin: "", newPin: "", newPinConfirm: "" })
        setShowPinForm(false)
        loadSignature()
      } else {
        setPinMsg({ type: "err", text: data?.message ?? "Error al guardar el PIN" })
      }
    } catch {
      setPinMsg({ type: "err", text: "Error de conexión" })
    } finally {
      setSavingPin(false)
    }
  }

  async function handleToggleDynKey() {
    setTogglingDyn(true)
    setDynMsg(null)
    const isEnabled = dynStatus?.enabled
    try {
      const r = await fetch(`/api/dynamic-key/${isEnabled ? "disable" : "enable"}`, {
        method: "POST",
        credentials: "include",
      })
      if (r.ok) {
        setDynMsg({ type: "ok", text: isEnabled ? "Clave dinámica desactivada" : "Clave dinámica activada" })
        loadDynamicKey()
      } else {
        const data = await r.json()
        setDynMsg({ type: "err", text: data?.message ?? "Error al cambiar estado" })
      }
    } catch {
      setDynMsg({ type: "err", text: "Error de conexión" })
    } finally {
      setTogglingDyn(false)
    }
  }

  async function handleGetDynKey() {
    setLoadingDynKey(true)
    setShowDynKey(true)
    try {
      const r = await fetch("/api/dynamic-key/current", { credentials: "include" })
      if (r.ok) {
        const d = await r.json()
        setDynKey({ key: d.key ?? d.code ?? "", expiresAt: d.expiresAt ?? d.expiry ?? "" })
      }
    } catch {
      setDynKey(null)
    } finally {
      setLoadingDynKey(false)
    }
  }

  const pinCreatedDate = status?.lastChangedAt || status?.pinCreatedAt

  return (
    <div className="flex flex-col gap-5">
      <DashCard className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Firma y PIN de operación</p>
          <p className="text-xs text-muted-foreground">Protege tus transacciones con seguridad adicional</p>
        </div>
      </DashCard>

      {error && (
        <DashCard className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />{error}
          </p>
        </DashCard>
      )}

      {/* Sección PIN */}
      <DashCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {loadingSig ? <Skeleton className="h-8 w-8 rounded-xl" /> : (
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", hasPIN ? "bg-green-400/10" : "bg-yellow-400/10")}>
                <Lock className={cn("h-4 w-4", hasPIN ? "text-green-400" : "text-yellow-400")} />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">PIN de operación</p>
              {loadingSig ? <Skeleton className="h-3 w-24 mt-0.5" /> : (
                <p className={cn("text-xs", hasPIN ? "text-green-400" : "text-yellow-400")}>
                  {hasPIN
                    ? (pinCreatedDate
                        ? `Configurado · ${new Date(pinCreatedDate).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}`
                        : "Configurado")
                    : "No configurado — crea tu PIN ahora"}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowPinForm((v) => !v); setPinMsg(null) }}
            disabled={loadingSig}
            className="shrink-0 h-8 text-xs"
          >
            {showPinForm
              ? <><ChevronUp className="h-3.5 w-3.5 mr-1" />Cancelar</>
              : hasPIN
                ? <><RotateCcw className="h-3.5 w-3.5 mr-1" />Cambiar PIN</>
                : <><KeyRound className="h-3.5 w-3.5 mr-1" />Crear PIN</>}
          </Button>
        </div>

        {pinMsg && (
          <div className={cn("mt-4 rounded-lg px-3 py-2 text-sm flex items-center gap-2", pinMsg.type === "ok" ? "bg-green-400/10 text-green-400" : "bg-destructive/10 text-destructive")}>
            {pinMsg.type === "ok"
              ? <CheckCircle className="h-4 w-4 shrink-0" />
              : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {pinMsg.text}
          </div>
        )}

        {showPinForm && (
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            {hasPIN && (
              <PinInput
                label="PIN actual"
                value={pinForm.currentPin}
                onChange={(v) => setPinForm((p) => ({ ...p, currentPin: v }))}
                show={showPins.current}
                onToggleShow={() => setShowPins((s) => ({ ...s, current: !s.current }))}
              />
            )}
            <PinInput
              label={hasPIN ? "Nuevo PIN" : "PIN (6 dígitos)"}
              value={pinForm.newPin}
              onChange={(v) => setPinForm((p) => ({ ...p, newPin: v }))}
              show={showPins.new}
              onToggleShow={() => setShowPins((s) => ({ ...s, new: !s.new }))}
            />
            <PinInput
              label="Confirmar PIN"
              value={pinForm.newPinConfirm}
              onChange={(v) => setPinForm((p) => ({ ...p, newPinConfirm: v }))}
              show={showPins.confirm}
              onToggleShow={() => setShowPins((s) => ({ ...s, confirm: !s.confirm }))}
            />
            <Button
              onClick={handleSavePin}
              disabled={
                savingPin ||
                pinForm.newPin.length < 4 ||
                pinForm.newPin !== pinForm.newPinConfirm ||
                (hasPIN ? !pinForm.currentPin : false)
              }
              className="self-end"
              size="sm"
            >
              {savingPin
                ? <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />Guardando…</>
                : hasPIN ? "Actualizar PIN" : "Crear PIN"}
            </Button>
          </div>
        )}
      </DashCard>

      {/* Sección Clave Dinámica */}
      <DashCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {loadingDyn ? <Skeleton className="h-8 w-8 rounded-xl" /> : (
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", dynStatus?.enabled ? "bg-green-400/10" : "bg-muted")}>
                {dynStatus?.enabled
                  ? <Zap className="h-4 w-4 text-green-400" />
                  : <ZapOff className="h-4 w-4 text-muted-foreground" />}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">Clave dinámica</p>
              {loadingDyn ? <Skeleton className="h-3 w-24 mt-0.5" /> : (
                <p className={cn("text-xs", dynStatus?.enabled ? "text-green-400" : "text-muted-foreground")}>
                  {dynStatus?.enabled ? "Habilitada — código de un solo uso" : "Deshabilitada"}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleDynKey}
            disabled={togglingDyn || loadingDyn}
            className={cn("shrink-0 h-8 text-xs", dynStatus?.enabled ? "text-destructive border-destructive/30 hover:bg-destructive/10" : "")}
          >
            {togglingDyn
              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              : dynStatus?.enabled
                ? <><ZapOff className="h-3.5 w-3.5 mr-1" />Desactivar</>
                : <><Zap className="h-3.5 w-3.5 mr-1" />Activar</>}
          </Button>
        </div>

        {dynMsg && (
          <div className={cn("mt-3 rounded-lg px-3 py-2 text-sm flex items-center gap-2", dynMsg.type === "ok" ? "bg-green-400/10 text-green-400" : "bg-destructive/10 text-destructive")}>
            {dynMsg.type === "ok"
              ? <CheckCircle className="h-4 w-4 shrink-0" />
              : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {dynMsg.text}
          </div>
        )}

        {dynStatus?.enabled && (
          <div className="mt-4 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetDynKey}
              disabled={loadingDynKey}
              className="h-8 text-xs"
            >
              {loadingDynKey
                ? <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />Generando…</>
                : <><Eye className="h-3.5 w-3.5 mr-1" />Ver clave actual</>}
            </Button>
            {showDynKey && dynKey && (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-muted/50 border border-border px-4 py-3">
                <p className="text-2xl font-mono font-bold text-foreground tracking-[0.3em] flex-1">
                  {dynKey.key}
                </p>
                {dynKey.expiresAt && (
                  <p className="text-xs text-muted-foreground shrink-0">
                    Expira: {new Date(dynKey.expiresAt).toLocaleTimeString("es-MX")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </DashCard>
    </div>
  )
}
