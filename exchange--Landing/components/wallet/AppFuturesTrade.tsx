"use client";

import React, { useState } from "react";

interface AppFuturesTradeProps {
  onSuccess?: () => void;
}

/**
 * Panel de trading Futuros — Long/Short con leverage, TP/SL.
 */
export default function AppFuturesTrade({ onSuccess }: AppFuturesTradeProps) {
  const [side, setSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [leverage, setLeverage] = useState(10);
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Long/Short Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)" }}>
        <button onClick={() => setSide("long")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", background: side === "long" ? "#22c55e" : "transparent", color: side === "long" ? "#000" : "rgba(255,255,255,0.35)", transition: "all 0.2s ease" }}>
          Long
        </button>
        <button onClick={() => setSide("short")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", background: side === "short" ? "#ef4444" : "transparent", color: side === "short" ? "#000" : "rgba(255,255,255,0.35)", transition: "all 0.2s ease" }}>
          Short
        </button>
      </div>

      {/* Order Type */}
      <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)" }}>
        <button onClick={() => setOrderType("limit")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: orderType === "limit" ? "rgba(255,255,255,0.08)" : "transparent", color: orderType === "limit" ? "#fff" : "rgba(255,255,255,0.4)", transition: "all 0.2s ease" }}>
          Límite
        </button>
        <button onClick={() => setOrderType("market")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: orderType === "market" ? "rgba(255,255,255,0.08)" : "transparent", color: orderType === "market" ? "#fff" : "rgba(255,255,255,0.4)", transition: "all 0.2s ease" }}>
          Mercado
        </button>
      </div>

      {/* Leverage */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", textTransform: "uppercase" }}>Leverage</span>
          <span className="quantico" style={{ color: "var(--accent)", fontSize: "16px", fontWeight: 700 }}>{leverage}x</span>
        </div>
        <input type="range" min="1" max="100" step="1" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#ffa80f", height: "4px", cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>1x</span>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>100x</span>
        </div>
      </div>

      {/* Inputs */}
      {orderType === "limit" && (
        <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 14px" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", textTransform: "uppercase" }}>Precio USDT</span>
          <input type="text" inputMode="decimal" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", width: "100%", outline: "none", caretColor: "var(--accent)", marginTop: "4px" }} />
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 14px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", textTransform: "uppercase" }}>Cantidad BTC</span>
        <input type="text" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
          style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", width: "100%", outline: "none", caretColor: "var(--accent)", marginTop: "4px" }} />
      </div>

      {/* TP/SL */}
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, background: "rgba(34,197,94,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(34,197,94,0.08)", borderRadius: "12px", padding: "10px 12px" }}>
          <span className="dm-sans" style={{ color: "#22c55e", fontSize: "10px", textTransform: "uppercase" }}>Take Profit</span>
          <input type="text" inputMode="decimal" placeholder="0.00" value={tp} onChange={(e) => setTp(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", width: "100%", outline: "none", caretColor: "#22c55e", marginTop: "4px" }} />
        </div>
        <div style={{ flex: 1, background: "rgba(239,68,68,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(239,68,68,0.08)", borderRadius: "12px", padding: "10px 12px" }}>
          <span className="dm-sans" style={{ color: "#ef4444", fontSize: "10px", textTransform: "uppercase" }}>Stop Loss</span>
          <input type="text" inputMode="decimal" placeholder="0.00" value={sl} onChange={(e) => setSl(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", width: "100%", outline: "none", caretColor: "#ef4444", marginTop: "4px" }} />
        </div>
      </div>

      {/* CTA */}
      <button onClick={onSuccess} disabled={!price || !amount}
        style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: (price && amount) ? "pointer" : "not-allowed", background: (price && amount) ? (side === "long" ? "#22c55e" : "#ef4444") : "rgba(255,255,255,0.06)", color: (price && amount) ? "#000" : "rgba(255,255,255,0.25)", fontSize: "14px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.2s ease", marginTop: "4px" }}>
        Abrir {side === "long" ? "Long" : "Short"} BTC {leverage}x
      </button>
    </div>
  );
}
