"use client";

import React, { useState } from "react";
import { ArrowLeft, Copy, QrCode } from "lucide-react";
import SendSuccessModal from "./SendSuccessModal";

interface AppSendScreenProps {
  onBack?: () => void;
}

/**
 * Pantalla Enviar — enviar crypto a una dirección o escanear QR.
 */
export default function AppSendScreen({ onBack }: AppSendScreenProps) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div
      className="wallet-action-screen"
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
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
          Enviar
        </span>
      </div>

      {/* Select Token */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
          Token
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src="/images/stablecoin/tether-usdt-logo_nwgfgy.svg"
            alt="USDT"
            style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "contain" }}
          />
          <span className="quantico" style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>USDT</span>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>▼</span>
        </div>
      </div>

      {/* Amount */}
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
          Monto
        </span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "22px",
            fontWeight: 700,
            fontFamily: "'Quantico', sans-serif",
            width: "100%",
            outline: "none",
            caretColor: "var(--accent)",
            marginTop: "4px",
          }}
        />
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
          Disponible: 3,500 USDT
        </span>
      </div>

      {/* Address */}
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
          Dirección de destino
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
          <input
            type="text"
            placeholder="0x... o pegar dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              flex: 1,
              outline: "none",
              caretColor: "var(--accent)",
            }}
          />
          <button
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Copy size={14} color="rgba(255,255,255,0.5)" />
          </button>
          <button
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <QrCode size={14} color="rgba(255,255,255,0.5)" />
          </button>
        </div>
      </div>

      {/* Fee info */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: "12px",
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
          Network fee
        </span>
        <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>
          ~0.25 USDT
        </span>
      </div>

      {/* Send CTA */}
      <button
        disabled={!amount || !address}
        onClick={() => { if (amount && address) setShowSuccess(true); }}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          cursor: amount && address ? "pointer" : "not-allowed",
          background: amount && address ? "var(--accent)" : "rgba(255,255,255,0.06)",
          color: amount && address ? "#000" : "rgba(255,255,255,0.25)",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "'Quantico', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          transition: "all 0.2s ease",
        }}
      >
        {amount && address ? `Enviar ${amount} USDT` : "Completa los datos"}
      </button>

      <p
        className="dm-sans"
        style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", textAlign: "center", margin: 0 }}
      >
        Verifica la dirección antes de enviar. Las transacciones blockchain son irreversibles.
      </p>

      <SendSuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        amount={amount}
        symbol="USDT"
      />
    </div>
  );
}
