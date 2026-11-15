"use client";

import React from "react";
import { CheckCircle, X } from "lucide-react";

interface BuySuccessModalProps {
  open: boolean;
  onClose: () => void;
  amount: string;
  payAmount: string;
  method: string;
  fee: number;
}

/**
 * Modal demostrativo al confirmar una compra.
 */
export default function BuySuccessModal({
  open,
  onClose,
  amount,
  payAmount,
  method,
  fee,
}: BuySuccessModalProps) {
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
            background: "rgba(34,197,94,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <CheckCircle size={32} color="#22c55e" />
        </div>

        <div>
          <span
            className="quantico"
            style={{
              color: "#22c55e",
              fontSize: "18px",
              fontWeight: 700,
              textTransform: "uppercase",
              display: "block",
            }}
          >
            ¡Compra exitosa!
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
            Demostración • No se ejecutó ninguna transacción real
          </span>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
              Pagaste
            </span>
            <span className="quantico" style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>
              ${payAmount} ({method})
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
              Comisión ({fee}%)
            </span>
            <span className="dm-sans" style={{ color: "#ef4444", fontSize: "12px", fontWeight: 600 }}>
              -${(parseFloat(payAmount) * fee / 100).toFixed(2)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.08)", paddingTop: "8px" }}>
            <span className="dm-sans" style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>
              Recibes
            </span>
            <span className="quantico" style={{ color: "var(--accent)", fontSize: "14px", fontWeight: 700 }}>
              {amount} USDT
            </span>
          </div>
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
          Esta es una simulación demostrativa de Deco Exchange. No se ha
          procesado ninguna compra real ni se han movido fondos.
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
