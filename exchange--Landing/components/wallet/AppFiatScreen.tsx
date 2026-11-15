"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Banknote, Building2, CreditCard, Info, ArrowDown, ChevronDown } from "lucide-react";
import FiatExchangeModal from "./FiatExchangeModal";

interface AppFiatScreenProps {
  onBack?: () => void;
}

const FIAT_CURRENCIES = [
  { code: "USD", name: "Dólar", flag: "🇺🇸", img: "/images/FiatAccepted/usa-us-usd-logo_lx28hi.svg" },
  { code: "COP", name: "Peso Colombiano", flag: "🇨🇴", img: "/images/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg" },
  { code: "MXN", name: "Peso Mexicano", flag: "🇲🇽", img: "/images/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", img: "/images/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg" },
  { code: "BRL", name: "Real Brasileño", flag: "🇧🇷", img: "/images/FiatAccepted/brasil-br-brl-logo_dcxcvj.svg" },
  { code: "PEN", name: "Sol Peruano", flag: "🇵🇪", img: "/images/FiatAccepted/peru-pe-sol-logo_rbaixq.svg" },
];

const RATES: Record<string, number> = { "USD-COP": 3900, "USD-MXN": 17.5, "USD-EUR": 0.92, "USD-BRL": 5.05, "USD-PEN": 3.75 };
const FEE_PERCENT = 1.5;

function getRate(from: string, to: string): number {
  if (from === to) return 1;
  if (from === "USD") return RATES[`USD-${to}`] || 1;
  if (to === "USD") return 1 / (RATES[`USD-${from}`] || 1);
  return (RATES[`USD-${to}`] || 1) / (RATES[`USD-${from}`] || 1);
}

/**
 * Pantalla Fiat — intercambio de monedas fiat.
 */
export default function AppFiatScreen({ onBack }: AppFiatScreenProps) {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState(FIAT_CURRENCIES[0]);
  const [toCurrency, setToCurrency] = useState(FIAT_CURRENCIES[1]);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const hasAmount = numAmount > 0;
  const rate = getRate(fromCurrency.code, toCurrency.code);
  const feeAmount = hasAmount ? numAmount * (FEE_PERCENT / 100) : 0;
  const receiveAmount = hasAmount ? (numAmount - feeAmount) * rate : 0;

  return (
    <div className="wallet-action-screen" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", background: "#080808", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <Banknote size={18} color="var(--accent)" />
        <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>Fiat</span>
      </div>

      {/* Envías */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px 16px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>Envías</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
          <input type="text" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: "20px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", width: "120px", outline: "none", caretColor: "var(--accent)" }} />
          <button onClick={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "rgba(255,255,255,0.06)", borderRadius: "20px", border: "none", cursor: "pointer" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: "#fff" }}>
              <img src={fromCurrency.img} alt={fromCurrency.code} style={{ width: "18px", height: "18px", objectFit: "cover", objectPosition: "center" }} />
            </div>
            <span className="quantico" style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{fromCurrency.code}</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          </button>
        </div>
      </div>

      {/* From Picker */}
      {showFromPicker && (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {FIAT_CURRENCIES.map((c) => (
            <button key={c.code} onClick={() => { setFromCurrency(c); setShowFromPicker(false); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: fromCurrency.code === c.code ? "rgba(255,168,15,0.08)" : "transparent" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: "#fff" }}>
                <img src={c.img} alt={c.code} style={{ width: "26px", height: "26px", objectFit: "cover", objectPosition: "center" }} />
              </div>
              <div>
                <span className="dm-sans" style={{ color: "#fff", fontSize: "13px", fontWeight: 500, display: "block" }}>{c.code}</span>
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{c.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Arrow */}
      <div style={{ display: "flex", justifyContent: "center", margin: "-4px 0", zIndex: 1 }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,168,15,0.12)", borderWidth: "2px", borderStyle: "solid", borderColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowDown size={16} color="var(--accent)" />
        </div>
      </div>

      {/* Recibes */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px 16px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>Recibes</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
          <span className="quantico" style={{ color: hasAmount ? "#22c55e" : "rgba(255,255,255,0.3)", fontSize: "20px", fontWeight: 700 }}>
            {hasAmount ? receiveAmount.toFixed(2) : "0.00"}
          </span>
          <button onClick={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "rgba(255,255,255,0.06)", borderRadius: "20px", border: "none", cursor: "pointer" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: "#fff" }}>
              <img src={toCurrency.img} alt={toCurrency.code} style={{ width: "18px", height: "18px", objectFit: "cover", objectPosition: "center" }} />
            </div>
            <span className="quantico" style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{toCurrency.code}</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          </button>
        </div>
      </div>

      {/* To Picker */}
      {showToPicker && (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {FIAT_CURRENCIES.filter((c) => c.code !== fromCurrency.code).map((c) => (
            <button key={c.code} onClick={() => { setToCurrency(c); setShowToPicker(false); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: toCurrency.code === c.code ? "rgba(255,168,15,0.08)" : "transparent" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: "#fff" }}>
                <img src={c.img} alt={c.code} style={{ width: "26px", height: "26px", objectFit: "cover", objectPosition: "center" }} />
              </div>
              <div>
                <span className="dm-sans" style={{ color: "#fff", fontSize: "13px", fontWeight: 500, display: "block" }}>{c.code}</span>
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{c.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Details */}
      <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
          <Info size={12} color="var(--accent)" />
          <span className="dm-sans" style={{ color: "var(--accent)", fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>Detalles</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Tasa</span>
          <span className="quantico" style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>1 {fromCurrency.code} = {rate.toFixed(4)} {toCurrency.code}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Comisión</span>
          <span className="quantico" style={{ color: "var(--accent)", fontSize: "11px", fontWeight: 600 }}>{FEE_PERCENT}%</span>
        </div>
        {hasAmount && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.05)", paddingTop: "6px" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Envías</span>
              <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{numAmount.toFixed(2)} {fromCurrency.code}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="dm-sans" style={{ color: "#ef4444", fontSize: "11px" }}>Comisión ({FEE_PERCENT}%)</span>
              <span className="quantico" style={{ color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>-{feeAmount.toFixed(2)} {fromCurrency.code}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.08)", paddingTop: "6px" }}>
              <span className="dm-sans" style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>Recibes</span>
              <span className="quantico" style={{ color: "#22c55e", fontSize: "14px", fontWeight: 700 }}>{receiveAmount.toFixed(2)} {toCurrency.code}</span>
            </div>
          </>
        )}
      </div>

      {/* Exchange CTA */}
      <button disabled={!hasAmount} onClick={() => hasAmount && setShowModal(true)}
        style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: hasAmount ? "pointer" : "not-allowed", background: hasAmount ? "var(--accent)" : "rgba(255,255,255,0.06)", color: hasAmount ? "#000" : "rgba(255,255,255,0.25)", fontSize: "14px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.2s ease", marginTop: "4px" }}>
        {hasAmount ? `Intercambiar ${fromCurrency.code} → ${toCurrency.code}` : "Ingresa un monto"}
      </button>

      <FiatExchangeModal open={showModal} onClose={() => setShowModal(false)} fromAmount={amount} fromCode={fromCurrency.code} toAmount={receiveAmount.toFixed(2)} toCode={toCurrency.code} fee={FEE_PERCENT} />
    </div>
  );
}
