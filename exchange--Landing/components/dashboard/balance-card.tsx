"use client"

import React, { useState } from "react"
import { Lock, PlusCircle, Info, QrCode } from "lucide-react"
import DashCard from "@/components/dashboard/dash-card"
import CurrencyIcon from "@/components/dashboard/currency-icon"
import WalletQRModal from "@/components/dashboard/wallet-qr-modal"
import ModalFundFiat from "@/components/dashboard/modal-fund-fiat"
import ModalFundCrypto from "@/components/dashboard/modal-fund-crypto"
import ModalCurrencyDetail from "@/components/dashboard/modal-currency-detail"
import ModalFundBlc from "@/components/dashboard/modal-fund-blc"
import type { WalletBalance, FundingChannel } from "@/components/dashboard/types"

interface BalanceCardProps {
  balance: WalletBalance
  accountNumber?: string
  onBalanceUpdated?: () => void
  fundingChannels?: FundingChannel[]
}

export default function BalanceCard({ balance, accountNumber, onBalanceUpdated, fundingChannels }: BalanceCardProps) {
  const [showFund, setShowFund] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const isZero = balance.available === 0 && balance.locked === 0
  const isBlc = balance.currency.toUpperCase() === "BLC"

  return (
    <>
      <DashCard className="hover:border-primary/30 transition-colors">
        {/* Cabecera: ícono + nombre + botón detalle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <CurrencyIcon currency={balance.currency} size={28} />
            <span className="text-sm font-semibold text-foreground">{isBlc ? "deco-exchange Credit" : balance.currency}</span>
            {isBlc && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                Unidad interna
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQR(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              title={`QR de ${balance.currency}`}
            >
              <QrCode className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowDetail(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              title={`Detalle de ${balance.currency}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Saldo */}
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {(balance.available + balance.locked).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: balance.type === "crypto" ? 8 : 2,
          })}
        </p>
        <div className="flex items-center justify-between mt-1 mb-3">
          <p className="text-xs text-muted-foreground">
            {isZero
              ? "Sin saldo"
              : `Disponible: ${balance.available.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: balance.type === "crypto" ? 8 : 2,
                })}`}
          </p>
          {balance.locked > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {balance.locked.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Botón cargar */}
        <button
          onClick={() => setShowFund(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 py-2 text-xs font-medium text-primary transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          {isBlc ? "Cargar BLC" : `Cargar ${balance.currency}`}
        </button>
      </DashCard>

      {/* Modales */}
      {showQR && balance.type === "fiat" && accountNumber && (
        <WalletQRModal
          currency={balance.currency}
          accountNumber={accountNumber}
          onClose={() => setShowQR(false)}
        />
      )}
      {showQR && balance.type === "crypto" && (
        <ModalFundCrypto
          currency={balance.currency}
          accountNumber={accountNumber}
          onClose={() => setShowQR(false)}
        />
      )}
      {showFund && balance.type === "fiat" && !isBlc && (
        <ModalFundFiat
          currency={balance.currency}
          accountNumber={accountNumber}
          onClose={() => setShowFund(false)}
          fundingChannels={fundingChannels}
        />
      )}
      {showFund && isBlc && (
        <ModalFundBlc
          open={showFund}
          onClose={() => setShowFund(false)}
          onSuccess={onBalanceUpdated}
        />
      )}
      {showFund && balance.type === "crypto" && (
        <ModalFundCrypto
          currency={balance.currency}
          accountNumber={accountNumber}
          onClose={() => setShowFund(false)}
        />
      )}
      {showDetail && (
        <ModalCurrencyDetail
          currency={balance.currency}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}
