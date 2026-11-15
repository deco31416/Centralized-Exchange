"use client"

import React, { useState } from "react"
import { X, Copy, CheckCircle, AlertTriangle, Layers, ChevronRight } from "lucide-react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons"
import { getCurrencyMetadata } from "@/components/dashboard/currency-metadata"
import type { NetworkOption } from "@/components/dashboard/currency-metadata"

interface ModalFundCryptoProps {
  currency: string
  accountNumber?: string
  onClose: () => void
}

export default function ModalFundCrypto({ currency, accountNumber, onClose }: ModalFundCryptoProps) {
  const meta = getCurrencyMetadata(currency)
  const iconSrc = LOCAL_CURRENCY_ICONS[currency.toUpperCase()]

  const isMultiNetwork = (meta?.networks?.length ?? 0) > 1
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(
    isMultiNetwork ? null : (meta?.networks?.[0] ?? null)
  )
  const [copied, setCopied] = useState(false)

  const address = accountNumber ?? ""
  const activeNetwork = selectedNetwork
  const qrValue = address
    ? `deco-exchange:${address}?currency=${currency}${activeNetwork ? `&network=${activeNetwork.id}` : ""}`
    : currency

  function handleCopy() {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl border border-border bg-card w-full max-w-sm mx-auto flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={currency}
                width={32}
                height={32}
                className="rounded-full"
                style={{ width: 32, height: 32, objectFit: "cover" }}
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {currency.slice(0, 2)}
              </span>
            )}
            <div>
              <p className="font-semibold text-foreground text-sm leading-tight">
                Recibir {meta?.name ?? currency}
              </p>
              <p className="text-xs text-muted-foreground">
                {currency} ·{" "}
                {activeNetwork
                  ? activeNetwork.name
                  : isMultiNetwork
                  ? "Selecciona red"
                  : (meta?.network ?? "Cripto")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col items-center gap-4 modal-scroll">

          {/* ── Vista 1: Selector de red (solo si multi-red y ninguna seleccionada) ── */}
          {isMultiNetwork && selectedNetwork === null ? (
            <div className="w-full flex flex-col gap-3">
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{currency} está disponible en varias redes</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Selecciona la red correcta antes de copiar tu dirección. Enviar desde una red incorrecta puede causar pérdida permanente de fondos.
                </p>
              </div>

              {/* Alerta crítica */}
              <div className="w-full rounded-xl border border-red-500/30 bg-red-500/8 p-3 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed font-medium">
                  Verifica que tu billetera envíe desde la misma red que selecciones aquí. Una red incorrecta = fondos perdidos.
                </p>
              </div>

              <div className="w-full flex flex-col gap-2">
                {meta!.networks!.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 p-3.5 transition-all text-left w-full"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
                      <Layers className="h-4 w-4 text-foreground" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{net.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{net.standard}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Vista 2: QR + dirección (red única o ya seleccionada) ── */
            <>
              {/* Badge de red si hay red activa */}
              {activeNetwork && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/40">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">{activeNetwork.name}</span>
                  <span className="text-[10px] text-muted-foreground">({activeNetwork.standard})</span>
                </div>
              )}

              {/* QR */}
              {address ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    value={qrValue}
                    size={176}
                    bgColor="#ffffff"
                    fgColor="#0a0a0a"
                    level="M"
                    includeMargin={false}
                  />
                </div>
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-muted/40 border border-dashed border-border">
                  <p className="text-xs text-muted-foreground text-center px-3">
                    Dirección no disponible. Asegúrate de tener una wallet activa.
                  </p>
                </div>
              )}

              {/* Instrucción */}
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Escanea el QR o copia la dirección para recibir{" "}
                <strong className="text-foreground">{currency}</strong>
                {activeNetwork ? ` en red ${activeNetwork.standard}` : ""}.
              </p>

              {/* Dirección copiable */}
              <div className="w-full flex flex-col gap-1.5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Tu dirección {currency}
                  {activeNetwork ? ` (${activeNetwork.standard})` : ""}
                </p>
                <div className="flex items-center gap-2 rounded-xl bg-muted/30 border border-border px-3 py-2.5">
                  <p className="flex-1 text-xs font-mono text-foreground truncate">
                    {address || "Sin dirección asignada"}
                  </p>
                  {address && (
                    <button
                      onClick={handleCopy}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      title="Copiar dirección"
                    >
                      {copied
                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                        : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {copied && (
                  <p className="text-[11px] text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Dirección copiada
                  </p>
                )}
              </div>

              {/* Advertencia de red — muestra el warning específico de la red si existe */}
              <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-red-400">Importante: </strong>
                  {activeNetwork?.warning
                    ? activeNetwork.warning
                    : `Solo envía ${currency}${meta?.network ? ` en la red ${meta.network}` : ""}. Usar una red incorrecta puede resultar en pérdida permanente de fondos.`
                  }
                </p>
              </div>
            </>
          )}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-border">
          <button
            onClick={isMultiNetwork && selectedNetwork !== null ? () => setSelectedNetwork(null) : onClose}
            className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-medium text-foreground transition-colors"
          >
            {isMultiNetwork && selectedNetwork !== null ? "← Cambiar red" : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  )
}

