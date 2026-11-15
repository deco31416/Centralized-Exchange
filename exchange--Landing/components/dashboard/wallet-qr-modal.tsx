"use client"

import React, { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { X, Copy, CheckCircle } from "lucide-react"
import { CURRENCY_ICONS } from "@/components/dashboard/constants"

interface WalletQRModalProps {
  currency: string
  accountNumber: string
  onClose: () => void
}

export default function WalletQRModal({ currency, accountNumber, onClose }: WalletQRModalProps) {
  const qrValue = `deco-exchange:${accountNumber}?currency=${currency}`
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-2xl border border-border bg-card p-6 w-full max-w-xs mx-4 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{CURRENCY_ICONS[currency] ?? "🪙"}</span>
            <p className="font-semibold text-foreground">Recibir {currency}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={qrValue} size={180} bgColor="#ffffff" fgColor="#0f0f0f" level="M" />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Escanea este QR para recibir {currency} en tu cuenta deco-exchange
        </p>
        <div className="w-full flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2">
          <p className="flex-1 text-xs font-mono text-foreground truncate">{accountNumber}</p>
          <button onClick={handleCopy} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
            {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
