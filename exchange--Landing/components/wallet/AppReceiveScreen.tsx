"use client";

import React, { useState } from "react";
import { ArrowLeft, Copy, Share2, Check, ChevronDown } from "lucide-react";
import ReceiveShareModal from "./ReceiveShareModal";

interface AppReceiveScreenProps {
  onBack?: () => void;
}

/**
 * Pantalla Recibir — muestra QR y dirección para recibir crypto.
 */
export default function AppReceiveScreen({ onBack }: AppReceiveScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const mockAddress = "0x1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r9S0t";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "#080808",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "10px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <span
          className="quantico"
          style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}
        >
          Recibir
        </span>
      </div>

      {/* Token selector — mismo ancho que Swap/Send inputs */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "14px 16px",
        }}
      >
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>
          Recibir en
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "6px",
          }}
        >
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
            Selecciona el token
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="/images/stablecoin/tether-usdt-logo_nwgfgy.svg"
              alt="USDT"
              style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "contain" }}
            />
            <span className="quantico" style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>USDT</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          </div>
        </div>
      </div>

      {/* QR Code — centrado, card */}
      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.05)",
          borderRadius: "14px",
          padding: "22px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "12px",
            boxShadow: "0 16px 34px rgba(0,0,0,0.35)",
          }}
        >
          <img
            src="/images/deco31416-qr.png"
            alt="QR www.deco31416.com"
            style={{
              width: "156px",
              height: "156px",
              display: "block",
              borderRadius: "8px",
            }}
          />
        </div>
        <span className="quantico" style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>
          www.deco31416.com
        </span>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
          Red: Ethereum (ERC-20)
        </span>
      </div>

      {/* Address — mismo ancho que las otras cards */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "14px 16px",
        }}
      >
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
          Tu dirección USDT
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className="dm-sans"
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "12px",
              wordBreak: "break-all",
              flex: 1,
            }}
          >
            {mockAddress}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
          >
            {copied ? (
              <Check size={16} color="#22c55e" />
            ) : (
              <Copy size={16} color="rgba(255,255,255,0.5)" />
            )}
          </button>
        </div>
      </div>

      {/* Actions — igual ancho */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Copy size={14} />
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background: "var(--accent)",
            color: "#000",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "'Quantico', sans-serif",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Share2 size={14} />
          Compartir
        </button>
      </div>

      <p
        className="dm-sans"
        style={{
          color: "rgba(255,255,255,0.25)",
          fontSize: "9px",
          textAlign: "center",
          margin: 0,
          lineHeight: "1.4",
        }}
      >
        Solo envía USDT en la red Ethereum (ERC-20) a esta dirección.
        Otros tokens o redes pueden resultar en pérdida de fondos.
      </p>

      <ReceiveShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        address={mockAddress}
        symbol="USDT"
      />
    </div>
  );
}
