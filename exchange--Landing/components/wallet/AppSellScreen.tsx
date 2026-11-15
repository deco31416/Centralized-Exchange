"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronDown, CreditCard, Building2, Banknote, QrCode, Info } from "lucide-react";
import SellSuccessModal from "./SellSuccessModal";

interface AppSellScreenProps {
  onBack?: () => void;
}

const PAYMENT_METHODS = [
  { icon: CreditCard, label: "Tarjeta", id: "card", fee: 5 },
  { icon: Building2, label: "Transferencia", id: "transfer", fee: 3 },
  { icon: Banknote, label: "Efectivo", id: "cash", fee: 7 },
  { icon: QrCode, label: "Pago QR", id: "qr", fee: 1.5 },
];

/**
 * Pantalla Vender — vender crypto y recibir fiat.
 */
export default function AppSellScreen({ onBack }: AppSellScreenProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showSuccess, setShowSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const hasAmount = numAmount > 0;
  const activeMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)!;

  const receiveAmount = useMemo(() => {
    if (!hasAmount) return "0.00";
    const afterFee = numAmount * (1 - activeMethod.fee / 100);
    return afterFee.toFixed(2);
  }, [numAmount, hasAmount, activeMethod]);

  return (
    <div className="wallet-action-screen" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", background: "#080808", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>Vender</span>
      </div>

      {/* You Sell */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px 16px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>Vendes</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
          <input type="text" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: "20px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", width: "120px", outline: "none", caretColor: "var(--accent)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "rgba(255,255,255,0.06)", borderRadius: "20px" }}>
            <img src="/images/stablecoin/tether-usdt-logo_nwgfgy.svg" alt="USDT" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "contain" }} />
            <span className="quantico" style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>USDT</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ display: "flex", justifyContent: "center", margin: "-4px 0", zIndex: 1 }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,168,15,0.12)", borderWidth: "2px", borderStyle: "solid", borderColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "var(--accent)", fontSize: "18px", fontWeight: 700 }}>↓</span>
        </div>
      </div>

      {/* You Receive */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px 16px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>Recibes</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
          <span className="quantico" style={{ color: hasAmount ? "#fff" : "rgba(255,255,255,0.3)", fontSize: "20px", fontWeight: 700 }}>
            {hasAmount ? receiveAmount : "0.00"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "rgba(255,255,255,0.06)", borderRadius: "20px" }}>
            <span className="dm-sans" style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>$</span>
            <span className="quantico" style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>USD</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
          <Info size={12} color="var(--accent)" />
          <span className="dm-sans" style={{ color: "var(--accent)", fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>Detalles</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Rate</span>
          <span className="quantico" style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>1 USDT = 1 USD</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Comisión ({activeMethod.label})</span>
          <span className="quantico" style={{ color: "var(--accent)", fontSize: "11px", fontWeight: 600 }}>{activeMethod.fee}%</span>
        </div>
        {hasAmount && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.05)", paddingTop: "6px" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Total a recibir (bruto)</span>
              <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>${numAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="dm-sans" style={{ color: "#ef4444", fontSize: "11px" }}>Comisión ({activeMethod.fee}%)</span>
              <span className="quantico" style={{ color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>-${(numAmount * activeMethod.fee / 100).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.08)", paddingTop: "6px" }}>
              <span className="dm-sans" style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>Recibes</span>
              <span className="quantico" style={{ color: "var(--accent)", fontSize: "14px", fontWeight: 700 }}>${receiveAmount} USD</span>
            </div>
          </>
        )}
      </div>

      {/* Payment method */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", padding: "12px 14px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Método de cobro</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isActive = paymentMethod === method.id;
            return (
              <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 8px", borderRadius: "10px", borderWidth: "1px", borderStyle: "solid", borderColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.08)", background: isActive ? "rgba(255,168,15,0.08)" : "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s ease" }}>
                <Icon size={18} color={isActive ? "var(--accent)" : "rgba(255,255,255,0.4)"} />
                <span className="dm-sans" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: isActive ? 600 : 400 }}>{method.label}</span>
                <span className="dm-sans" style={{ color: isActive ? "var(--accent)" : "rgba(255,255,255,0.3)", fontSize: "9px" }}>{method.fee}% com.</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sell CTA */}
      <button disabled={!hasAmount} onClick={() => hasAmount && setShowSuccess(true)}
        style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: hasAmount ? "pointer" : "not-allowed", background: hasAmount ? "var(--accent)" : "rgba(255,255,255,0.06)", color: hasAmount ? "#000" : "rgba(255,255,255,0.25)", fontSize: "14px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.2s ease", marginTop: "4px" }}>
        {hasAmount ? `Vender ${amount} USDT` : "Ingresa un monto"}
      </button>

      <p className="dm-sans" style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", textAlign: "center", margin: 0 }}>
        El pago se acreditará según el método de cobro seleccionado.
      </p>

      <SellSuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} amount={receiveAmount} cryptoAmount={amount} method={activeMethod.label} fee={activeMethod.fee} />
    </div>
  );
}
