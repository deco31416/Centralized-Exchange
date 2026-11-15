"use client"

import React from "react"
import { X, Globe, Shield, Layers, Hash, Calendar, Infinity, Building2, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons"
import { getCurrencyMetadata } from "@/components/dashboard/currency-metadata"

interface ModalCurrencyDetailProps {
  currency: string
  onClose: () => void
}

export default function ModalCurrencyDetail({ currency, onClose }: ModalCurrencyDetailProps) {
  const meta = getCurrencyMetadata(currency)
  const iconSrc = LOCAL_CURRENCY_ICONS[currency.toUpperCase()]

  if (!meta) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="rounded-2xl border border-border bg-card p-6 w-full max-w-sm mx-auto text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-muted-foreground text-sm">Sin información disponible para {currency}.</p>
          <button onClick={onClose} className="mt-4 text-xs text-primary hover:underline">Cerrar</button>
        </div>
      </div>
    )
  }

  const isCrypto = meta.type === "crypto"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl border border-border bg-card w-full max-w-md mx-auto flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={currency}
                width={36}
                height={36}
                className="rounded-full"
                style={{ width: 36, height: 36, objectFit: "cover" }}
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {currency.slice(0, 2)}
              </span>
            )}
            <div>
              <p className="font-semibold text-foreground text-base leading-tight">{meta.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono text-muted-foreground">{meta.code}</span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    isCrypto
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {isCrypto ? "Cripto" : "Fiat"}
                </span>
                {meta.category && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border capitalize">
                    {meta.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4 modal-scroll">
          {/* Descripción */}
          <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>

          {/* Grid de datos */}
          <div className="grid grid-cols-2 gap-2">
            <DataRow icon={<Hash className="h-3.5 w-3.5" />} label="Símbolo" value={`${meta.symbol} ${meta.code}`} />
            <DataRow icon={<Layers className="h-3.5 w-3.5" />} label="Decimales" value={String(meta.decimals)} />
            <DataRow icon={<Building2 className="h-3.5 w-3.5" />} label="Emisor" value={meta.issuer} span />
            {meta.country && (
              <DataRow icon={<Globe className="h-3.5 w-3.5" />} label="País / Zona" value={meta.country} span />
            )}
            {isCrypto && meta.network && (
              <DataRow icon={<Layers className="h-3.5 w-3.5" />} label="Red" value={meta.network} span />
            )}
            {isCrypto && meta.standard && (
              <DataRow icon={<Hash className="h-3.5 w-3.5" />} label="Estándar" value={meta.standard} span />
            )}
            {isCrypto && meta.launchYear && (
              <DataRow icon={<Calendar className="h-3.5 w-3.5" />} label="Lanzamiento" value={String(meta.launchYear)} />
            )}
            {isCrypto && meta.maxSupply && (
              <DataRow icon={<Infinity className="h-3.5 w-3.5" />} label="Suministro máx." value={meta.maxSupply} span />
            )}
          </div>

          {/* Nota legal */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-500 mb-1">Nota Legal</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{meta.legalNote}</p>
            </div>
          </div>

          {/* Link externo */}
          {isCrypto && meta.website && (
            <a
              href={meta.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              Sitio oficial: {meta.website}
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-medium text-foreground transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helper interno ──────────────────────────────────────────────────────────
function DataRow({
  icon,
  label,
  value,
  span,
}: {
  icon: React.ReactNode
  label: string
  value: string
  span?: boolean
}) {
  return (
    <div className={`flex flex-col gap-0.5 rounded-xl bg-muted/40 border border-border p-2.5 ${span ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xs font-semibold text-foreground leading-snug">{value}</p>
    </div>
  )
}
