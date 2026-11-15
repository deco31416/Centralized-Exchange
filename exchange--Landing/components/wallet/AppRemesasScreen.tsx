"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronDown, Globe, MapPin, Info, Send } from "lucide-react";
import SendSuccessModal from "./SendSuccessModal";

interface AppRemesasScreenProps {
  onBack?: () => void;
}

const COUNTRIES = [
  { code: "CO", name: "Colombia", flag: "🇨🇴", currency: "COP", rate: 3900 },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", currency: "VES", rate: 58 },
  { code: "MX", name: "México", flag: "🇲🇽", currency: "MXN", rate: 17.5 },
  { code: "AR", name: "Argentina", flag: "🇦🇷", currency: "ARS", rate: 870 },
  { code: "PE", name: "Perú", flag: "🇵🇪", currency: "PEN", rate: 3.75 },
  { code: "BR", name: "Brasil", flag: "🇧🇷", currency: "BRL", rate: 5.05 },
];

const FEE_PERCENT = 1.5; // Comisión fija para remesas

/**
 * Pantalla Remesas — enviar dinero al extranjero con crypto.
 */
export default function AppRemesasScreen({ onBack }: AppRemesasScreenProps) {
  const [amount, setAmount] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const hasAmount = numAmount > 0;

  const receiveAmount = useMemo(() => {
    if (!hasAmount) return "0.00";
    const afterFee = numAmount * (1 - FEE_PERCENT / 100);
    return (afterFee * selectedCountry.rate).toFixed(2);
  }, [numAmount, hasAmount, selectedCountry]);

  return (
    <div className="wallet-action-screen" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", background: "#080808", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Globe size={18} color="var(--accent)" />
          <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>Remesas</span>
        </div>
      </div>

      {/* Envías */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px 16px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>Envías</span>
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
          <Send size={14} color="var(--accent)" />
        </div>
      </div>

      {/* Reciben */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px 16px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>Reciben ({selectedCountry.currency})</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
          <span className="quantico" style={{ color: hasAmount ? "#22c55e" : "rgba(255,255,255,0.3)", fontSize: "20px", fontWeight: 700 }}>
            {hasAmount ? receiveAmount : "0.00"}
          </span>
          <button onClick={() => setShowPicker(!showPicker)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "rgba(255,255,255,0.06)", borderRadius: "20px", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "16px" }}>{selectedCountry.flag}</span>
            <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{selectedCountry.currency}</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          </button>
        </div>
      </div>

      {/* Country picker */}
      {showPicker && (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", textTransform: "uppercase", padding: "4px 8px" }}>Selecciona país</span>
          {COUNTRIES.map((c) => (
            <button key={c.code} onClick={() => { setSelectedCountry(c); setShowPicker(false); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: selectedCountry.code === c.code ? "rgba(255,168,15,0.08)" : "transparent", transition: "background 0.15s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>{c.flag}</span>
                <div>
                  <span className="dm-sans" style={{ color: "#fff", fontSize: "13px", fontWeight: 500, display: "block" }}>{c.name}</span>
                  <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>1 USD = {c.rate} {c.currency}</span>
                </div>
              </div>
              <MapPin size={14} color={selectedCountry.code === c.code ? "var(--accent)" : "rgba(255,255,255,0.2)"} />
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
          <span className="quantico" style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>1 USD = {selectedCountry.rate} {selectedCountry.currency}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Comisión</span>
          <span className="quantico" style={{ color: "var(--accent)", fontSize: "11px", fontWeight: 600 }}>{FEE_PERCENT}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>Tiempo estimado</span>
          <span className="quantico" style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>5-15 minutos</span>
        </div>
      </div>

      {/* Send CTA */}
      <button disabled={!hasAmount} onClick={() => hasAmount && setShowSuccess(true)}
        style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: hasAmount ? "pointer" : "not-allowed", background: hasAmount ? "var(--accent)" : "rgba(255,255,255,0.06)", color: hasAmount ? "#000" : "rgba(255,255,255,0.25)", fontSize: "14px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.2s ease", marginTop: "4px" }}>
        {hasAmount ? `Enviar a ${selectedCountry.name}` : "Ingresa un monto"}
      </button>

      <p className="dm-sans" style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", textAlign: "center", margin: 0 }}>
        El destinatario recibirá {selectedCountry.currency} en su cuenta local.
      </p>

      <SendSuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} amount={amount} symbol="USDT" />
    </div>
  );
}
