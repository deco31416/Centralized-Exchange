"use client";

import React, { useState } from "react";

interface AppSpotTradeProps {
  onSuccess?: () => void;
}

/**
 * Panel de trading Spot — Comprar/Vender con Límite/Mercado.
 */
export default function AppSpotTrade({ onSuccess }: AppSpotTradeProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  const total = (parseFloat(price || "0") * parseFloat(amount || "0")).toFixed(2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Buy/Sell Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)" }}>
        <button onClick={() => setSide("buy")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", background: side === "buy" ? "#22c55e" : "transparent", color: side === "buy" ? "#000" : "rgba(255,255,255,0.35)", transition: "all 0.2s ease" }}>
          Comprar
        </button>
        <button onClick={() => setSide("sell")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", background: side === "sell" ? "#ef4444" : "transparent", color: side === "sell" ? "#000" : "rgba(255,255,255,0.35)", transition: "all 0.2s ease" }}>
          Vender
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
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.05)" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Total</span>
          <span className="quantico" style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>${total} USDT</span>
        </div>
      </div>

      {/* CTA */}
      <button onClick={onSuccess} disabled={!price || !amount}
        style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: (price && amount) ? "pointer" : "not-allowed", background: (price && amount) ? (side === "buy" ? "#22c55e" : "#ef4444") : "rgba(255,255,255,0.06)", color: (price && amount) ? "#000" : "rgba(255,255,255,0.25)", fontSize: "14px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.2s ease" }}>
        {side === "buy" ? "Comprar" : "Vender"} BTC
      </button>
    </div>
  );
}
