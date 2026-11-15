"use client";

import React from "react";
import { CheckCircle, X, Copy } from "lucide-react";

interface ReceiveShareModalProps {
  open: boolean;
  onClose: () => void;
  address: string;
  symbol: string;
}

/**
 * Modal demostrativo al compartir dirección de recepción.
 */
export default function ReceiveShareModal({
  open,
  onClose,
  address,
  symbol,
}: ReceiveShareModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#141414",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "28px 24px",
          width: "100%",
          maxWidth: "290px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={14} color="rgba(255,255,255,0.6)" />
          </button>
        </div>

        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(255,168,15,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <Copy size={28} color="var(--accent)" />
        </div>

        <div>
          <span
            className="quantico"
            style={{
              color: "var(--accent)",
              fontSize: "18px",
              fontWeight: 700,
              textTransform: "uppercase",
              display: "block",
            }}
          >
            Dirección {symbol}
          </span>
          <span
            className="dm-sans"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "12px",
              marginTop: "4px",
              display: "block",
            }}
          >
            Demostración • Comparte esta dirección para recibir
          </span>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            padding: "14px 16px",
            wordBreak: "break-all",
          }}
        >
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", lineHeight: "1.5" }}>
            {address}
          </span>
        </div>

        <p
          className="dm-sans"
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "10px",
            lineHeight: "1.4",
            margin: 0,
          }}
        >
          Esta es una simulación demostrativa de Deco Exchange. No es una
          dirección real ni se está recibiendo fondos.
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
