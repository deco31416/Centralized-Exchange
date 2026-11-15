"use client"

import React, { useState } from "react"
import {
  X, Building2, Smartphone, Store, Banknote, ChevronRight,
  Copy, CheckCircle, AlertTriangle, ExternalLink, Globe, Zap,
  Upload, Hash, FileText,
} from "lucide-react"
import Image from "next/image"
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons"
import { getCurrencyMetadata } from "@/components/dashboard/currency-metadata"
import type { FundMethodId } from "@/components/dashboard/currency-metadata"
import type { FundingChannel } from "@/components/dashboard/types"

interface ModalFundFiatProps {
  currency: string
  accountNumber?: string
  onClose: () => void
  fundingChannels?: FundingChannel[]
}

// ── Registro completo de todos los métodos posibles ─────────────────────────
const FUND_METHODS_REGISTRY: Record<
  FundMethodId,
  {
    icon: React.ReactNode
    title: string
    description: string
    badge: string
    badgeColor: string
  }
> = {
  spei: {
    icon: <Building2 className="h-5 w-5" />,
    title: "SPEI / Transferencia",
    description: "Transferencia bancaria vía CLABE interbancaria. Sin límite de banco.",
    badge: "Gratis",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  card: {
    icon: <Smartphone className="h-5 w-5" />,
    title: "Tarjeta de débito / crédito",
    description: "Visa, Mastercard y American Express. Acredita al instante.",
    badge: "Rápido",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  store: {
    icon: <Store className="h-5 w-5" />,
    title: "Tiendas autorizadas",
    description: "Oxxo, 7-Eleven, Farmacias del Ahorro y más. Pago en efectivo.",
    badge: "Efectivo",
    badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  deposit: {
    icon: <Banknote className="h-5 w-5" />,
    title: "Depósito en banco",
    description: "Depósito en ventanilla en bancos participantes.",
    badge: "1–2 días",
    badgeColor: "text-muted-foreground bg-muted border-border",
  },
  ach: {
    icon: <Building2 className="h-5 w-5" />,
    title: "ACH Transfer",
    description: "Transferencia ACH desde banco estadounidense. Proceso seguro.",
    badge: "1–3 días",
    badgeColor: "text-muted-foreground bg-muted border-border",
  },
  wire: {
    icon: <Globe className="h-5 w-5" />,
    title: "Wire Transfer (SWIFT)",
    description: "Transferencia bancaria internacional. Disponible desde cualquier banco.",
    badge: "1–2 días",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  pse: {
    icon: <Zap className="h-5 w-5" />,
    title: "PSE",
    description: "Débito en línea desde tu cuenta bancaria colombiana vía PSE.",
    badge: "Instantáneo",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  nequi: {
    icon: <Smartphone className="h-5 w-5" />,
    title: "Nequi / Bancolombia",
    description: "Envío desde billetera Nequi o cuenta Bancolombia directamente.",
    badge: "Rápido",
    badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
  sepa: {
    icon: <Building2 className="h-5 w-5" />,
    title: "SEPA Transfer",
    description: "Transferencia bancaria en euros dentro de la zona SEPA (EU + EEA).",
    badge: "Gratis",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/20",
  },
}

// Fallback: si la moneda no tiene métodos definidos, mostramos tarjeta + wire
const DEFAULT_METHODS: FundMethodId[] = ["card", "wire"]

export default function ModalFundFiat({ currency, accountNumber, onClose, fundingChannels }: ModalFundFiatProps) {
  const [selected, setSelected] = useState<FundMethodId | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<FundingChannel | null>(null)
  const [copied, setCopied] = useState(false)
  const meta = getCurrencyMetadata(currency)
  const iconSrc = LOCAL_CURRENCY_ICONS[currency.toUpperCase()]

  // Canales habilitados del backend — cuando existen, el modal usa renderizado dinámico.
  // Esto garantiza que Pago Móvil, transferencias bancarias y otros métodos manuales
  // lleguen siempre del backend (asset-registry) y no hardcodeados en el frontend.
  const enabledChannels = (fundingChannels ?? []).filter((c) => c.isEnabled !== false)
  const useDynamic = enabledChannels.length > 0

  const availableMethods: FundMethodId[] = meta?.fundMethods ?? DEFAULT_METHODS
  const methods = availableMethods.map((id) => ({ id, ...FUND_METHODS_REGISTRY[id] }))

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isInDetail = useDynamic ? selectedChannel !== null : selected !== null
  function handleBack() {
    if (useDynamic) setSelectedChannel(null)
    else setSelected(null)
  }

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
                Cargar {meta?.name ?? currency}
              </p>
              <p className="text-xs text-muted-foreground">{currency} · Moneda fiat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-3 modal-scroll">
          {useDynamic ? (
            // ── Renderizado dinámico: canales desde asset-registry ──
            selectedChannel === null ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Elige el método de depósito para{" "}
                  <span className="text-foreground font-medium">{meta?.name ?? currency}</span>:
                </p>
                <div className="flex flex-col gap-2">
                  {enabledChannels.map((ch, idx) => {
                    const Icon = ch.type === 'mobile_payment' ? Smartphone : Building2
                    const timeLabel = ch.expectedConfirmationMinutes
                      ? ch.expectedConfirmationMinutes < 60
                        ? `~${ch.expectedConfirmationMinutes} min`
                        : `~${Math.round(ch.expectedConfirmationMinutes / 60)} h`
                      : 'Manual'
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedChannel(ch)}
                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 p-3.5 transition-all text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card border border-border text-foreground">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{ch.displayName ?? ch.provider ?? ch.type}</p>
                          {ch.bankName && (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{ch.bankName}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border text-muted-foreground bg-muted border-border">
                            {timeLabel}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <DynamicChannelDetail
                channel={selectedChannel}
                copied={copied}
                onCopy={handleCopy}
                onBack={handleBack}
              />
            )
          ) : (
            // ── Renderizado estático: métodos definidos en currency-metadata ──
            selected === null ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Elige el método de depósito para{" "}
                  <span className="text-foreground font-medium">{meta?.name ?? currency}</span>:
                </p>
                <div className="flex flex-col gap-2">
                  {methods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelected(method.id)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 p-3.5 transition-all text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card border border-border text-foreground">
                        {method.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{method.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{method.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${method.badgeColor}`}>
                          {method.badge}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <FundMethodDetail
                method={selected}
                currency={currency}
                meta={meta}
                accountNumber={accountNumber}
                copied={copied}
                onCopy={handleCopy}
                onBack={() => setSelected(null)}
              />
            )
          )}

          {/* Nota */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Los fondos se acreditan en tu saldo de {currency} en deco-exchange. Los tiempos pueden variar según tu banco.
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-border">
          <button
            onClick={isInDetail ? handleBack : onClose}
            className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-medium text-foreground transition-colors"
          >
            {isInDetail ? "← Volver a métodos" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detalle dinámico (canales desde asset-registry) ────────────────────────
function DynamicChannelDetail({
  channel,
  copied,
  onCopy,
  onBack,
}: {
  channel: FundingChannel
  copied: boolean
  onCopy: (text: string) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <BackButton onBack={onBack} />
      <p className="text-sm font-medium text-foreground">
        {channel.displayName ?? channel.provider ?? channel.type}
      </p>
      {channel.instructions && (
        <p className="text-xs text-muted-foreground leading-relaxed">{channel.instructions}</p>
      )}
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
        {channel.beneficiaryName && (
          <InfoLine label="Beneficiario" value={channel.beneficiaryName} />
        )}
        {channel.bankName && (
          <InfoLine label="Banco" value={channel.bankName + (channel.bankCode ? ` (${channel.bankCode})` : '')} />
        )}
        {channel.accountNumberMasked && (
          <InfoLine label="Cuenta" value={channel.accountNumberMasked} />
        )}
        {channel.accountAlias && (
          <CopyLine label="Alias / Chave PIX" value={channel.accountAlias} copied={copied} onCopy={() => onCopy(channel.accountAlias!)} />
        )}
        {channel.phone && (
          <InfoLine label="Teléfono" value={channel.phone} />
        )}
        {channel.documentId && (
          <InfoLine label="Cédula / RIF" value={channel.documentId} />
        )}
        {channel.minAmount !== undefined && channel.maxAmount !== undefined && (
          <InfoLine
            label="Límite por operación"
            value={`${channel.minAmount.toLocaleString('es-MX')} – ${channel.maxAmount.toLocaleString('es-MX')} ${channel.currency ?? ''}`}
          />
        )}
        {channel.expectedConfirmationMinutes !== undefined && (
          <InfoLine
            label="Tiempo estimado"
            value={
              channel.expectedConfirmationMinutes < 60
                ? `~${channel.expectedConfirmationMinutes} minutos`
                : `~${Math.round(channel.expectedConfirmationMinutes / 60)} hora(s)`
            }
          />
        )}
      </div>
      {/* Requisitos de confirmación manual */}
      {(channel.requiresProofUpload || channel.requiresReferenceNumber || channel.requiresSenderName || channel.requiresSenderDocument) && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide">Debes enviar al soporte</p>
          {channel.requiresProofUpload && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              Comprobante de pago (captura o PDF)
            </div>
          )}
          {channel.requiresReferenceNumber && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              Número de referencia de la operación
            </div>
          )}
          {channel.requiresSenderName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              Nombre del emisor
            </div>
          )}
          {channel.requiresSenderDocument && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              Documento de identidad del emisor
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Detalle por método ──────────────────────────────────────────────────────
function FundMethodDetail({
  method,
  currency,
  meta,
  accountNumber,
  copied,
  onCopy,
  onBack,
}: {
  method: FundMethodId
  currency: string
  meta: ReturnType<typeof getCurrencyMetadata>
  accountNumber?: string
  copied: boolean
  onCopy: (text: string) => void
  onBack: () => void
}) {
  const account = accountNumber ?? "—"

  if (method === "spei") {
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">Transferencia SPEI</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Realiza una transferencia desde cualquier banco mexicano usando esta CLABE. El acreditamiento es automático.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
          <InfoLine label="Banco receptor" value="STP (Sistema de Transferencias y Pagos)" />
          <InfoLine label="Beneficiario" value="deco-exchange / Usuario" />
          <CopyLine label="CLABE" value={account} copied={copied} onCopy={() => onCopy(account)} />
          <InfoLine label="Concepto" value={`Depósito ${currency} deco-exchange`} />
          <InfoLine label="Monto" value="El que desees fondear" />
        </div>
        <p className="text-xs text-muted-foreground">⏱ Acreditamiento en 5–30 min en días hábiles.</p>
      </div>
    )
  }

  if (method === "card") {
    const fee = currency === "USD" ? "2.9% + $0.30 USD" : currency === "EUR" ? "2.5% + €0.25" : "2.9% + $3.00 MXN"
    const limit = currency === "USD" ? "Up to $2,000 USD" : currency === "EUR" ? "Hasta €2,000" : "Hasta $50,000 MXN"
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">Tarjeta de débito / crédito</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Paga con tu tarjeta Visa, Mastercard o American Express. El proceso es seguro y cifrado con 3D Secure.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <InfoLine label="Redes aceptadas" value="Visa · Mastercard · American Express" />
          <InfoLine label="Comisión" value={fee} />
          <InfoLine label="Límite" value={limit} />
          <InfoLine label="Acreditamiento" value="Inmediato" />
        </div>
        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
          <ExternalLink className="h-4 w-4" />
          Ir al formulario de pago
        </button>
        <p className="text-xs text-muted-foreground text-center">Serás redirigido al procesador de pagos seguro.</p>
      </div>
    )
  }

  if (method === "store") {
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">Tiendas autorizadas</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Paga en efectivo en miles de puntos de venta. Proporciona tu referencia de pago en caja.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <InfoLine label="Tiendas" value="Oxxo · 7-Eleven · Farmacias del Ahorro · Walmart" />
          <InfoLine label="Comisión" value="$15 MXN fijos por transacción" />
          <InfoLine label="Límite" value="Hasta $10,000 MXN por operación" />
          <InfoLine label="Acreditamiento" value="2–4 horas después del pago" />
        </div>
        <CopyLine label="Referencia de pago" value={account} copied={copied} onCopy={() => onCopy(account)} />
      </div>
    )
  }

  if (method === "deposit") {
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">Depósito en banco</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Acude a ventanilla bancaria e indica los siguientes datos para tu depósito.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <InfoLine label="Banco" value="BBVA · Banamex · Santander · HSBC · Banorte" />
          <InfoLine label="Beneficiario" value="deco-exchange / DECO EXCHANGE" />
          <InfoLine label="Cuenta" value={account} />
          <InfoLine label="Comisión bancaria" value="Según tu banco (~$30–$60 MXN)" />
          <InfoLine label="Acreditamiento" value="1–2 días hábiles" />
        </div>
        <p className="text-xs text-muted-foreground">Guarda tu comprobante en caso de aclaración.</p>
      </div>
    )
  }

  if (method === "ach") {
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">ACH Transfer</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Envía desde tu banco estadounidense usando estos datos ACH. Disponible para cuentas de EE.UU.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <InfoLine label="Nombre del banco" value="Bancorp / Evolve Bank" />
          <InfoLine label="Beneficiario" value="deco-exchange Inc." />
          <CopyLine label="Routing Number" value="124085066" copied={copied} onCopy={() => onCopy("124085066")} />
          <CopyLine label="Account Number" value={account} copied={false} onCopy={() => onCopy(account)} />
          <InfoLine label="Account Type" value="Checking" />
          <InfoLine label="Fee" value="No fee" />
          <InfoLine label="Settlement" value="1–3 business days" />
        </div>
      </div>
    )
  }

  if (method === "wire") {
    const isEUR = currency === "EUR"
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">Wire Transfer (SWIFT)</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Transferencia bancaria internacional. Disponible desde cualquier banco del mundo.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <InfoLine label="Bank Name" value={isEUR ? "Bankhaus Scheich (DE)" : "Bancorp Bank (US)"} />
          <InfoLine label="Bank Address" value={isEUR ? "Frankfurt, Germany" : "Wilmington, DE, USA"} />
          <InfoLine label="Beneficiary" value="deco-exchange / DECO EXCHANGE" />
          <CopyLine label="SWIFT / BIC" value={isEUR ? "BSCHDEFFXXX" : "BOFAUS3NXXX"} copied={copied} onCopy={() => onCopy(isEUR ? "BSCHDEFFXXX" : "BOFAUS3NXXX")} />
          <CopyLine label="IBAN / Account" value={account} copied={false} onCopy={() => onCopy(account)} />
          <InfoLine label="Reference" value={`deco-exchange deposit ${currency}`} />
          <InfoLine label="Fee" value="Varies by sending bank" />
          <InfoLine label="Settlement" value="1–2 business days" />
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Asegúrate de incluir la referencia exacta para evitar rechazos en tu depósito.
          </p>
        </div>
      </div>
    )
  }

  if (method === "pse") {
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">PSE — Pago Seguro en Línea</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Realiza un débito directo desde tu cuenta bancaria colombiana a través de la plataforma PSE.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <InfoLine label="Bancos disponibles" value="Bancolombia · Davivienda · Banco de Bogotá · Nequi · +30 más" />
          <InfoLine label="Comisión" value="$800 COP por transacción" />
          <InfoLine label="Límite" value="Hasta $10,000,000 COP por operación" />
          <InfoLine label="Acreditamiento" value="Instantáneo" />
        </div>
        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
          <ExternalLink className="h-4 w-4" />
          Iniciar pago con PSE
        </button>
        <p className="text-xs text-muted-foreground text-center">Serás redirigido al portal PSE de tu banco.</p>
      </div>
    )
  }

  if (method === "nequi") {
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">Nequi / Bancolombia</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Envía desde tu app Nequi o cuenta Bancolombia directamente al número registrado en deco-exchange.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <CopyLine label="Número Nequi / Celular" value={account} copied={copied} onCopy={() => onCopy(account)} />
          <InfoLine label="Nombre" value="deco-exchange / DECO EXCHANGE" />
          <InfoLine label="Comisión" value="Gratis entre Nequi" />
          <InfoLine label="Límite diario" value="Hasta $3,000,000 COP" />
          <InfoLine label="Acreditamiento" value="Inmediato" />
        </div>
        <p className="text-xs text-muted-foreground">
          En Bancolombia: usa "Transferencia a Nequi" con el número de arriba.
        </p>
      </div>
    )
  }

  if (method === "sepa") {
    return (
      <div className="flex flex-col gap-3">
        <BackButton onBack={onBack} />
        <p className="text-sm font-medium text-foreground">SEPA Transfer</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Transferencia bancaria en euros dentro del espacio SEPA (UE + EEA). Sin comisión adicional.
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
          <InfoLine label="Beneficiario" value="deco-exchange / DECO EXCHANGE GmbH" />
          <InfoLine label="Banco" value="Bankhaus Scheich (DE)" />
          <CopyLine label="IBAN" value={account} copied={copied} onCopy={() => onCopy(account)} />
          <CopyLine label="BIC / SWIFT" value="BSCHDEFFXXX" copied={false} onCopy={() => onCopy("BSCHDEFFXXX")} />
          <InfoLine label="Referencia" value={`deco-exchange EUR deposit`} />
          <InfoLine label="Comisión" value="Gratis (SEPA Credit Transfer)" />
          <InfoLine label="Acreditamiento" value="1 día hábil (D+1)" />
        </div>
      </div>
    )
  }

  return null
}

// ── Helpers visuales ────────────────────────────────────────────────────────
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit transition-colors"
    >
      ← Volver a métodos
    </button>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

function CopyLine({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2 rounded-lg bg-background border border-border px-3 py-2">
        <p className="flex-1 text-xs font-mono text-foreground truncate">{value}</p>
        <button
          onClick={onCopy}
          className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
          title={`Copiar ${label}`}
        >
          {copied
            ? <CheckCircle className="h-4 w-4 text-green-400" />
            : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
