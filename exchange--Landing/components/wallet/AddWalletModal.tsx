"use client";

import React, { useState } from "react";
import { X, CheckCircle, Wallet, Bitcoin, Banknote } from "lucide-react";

interface AddWalletModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal demostrativo para agregar wallet (cripto o fiat).
 */
export default function AddWalletModal({ open, onClose }: AddWalletModalProps) {
  const [step, setStep] = useState<"select" | "success">("select");
  const [type, setType] = useState<"crypto" | "fiat" | null>(null);

  if (!open) return null;

  const handleAdd = () => {
    if (!type) return;
    setStep("success");
  };

  const handleClose = () => {
    setStep("select");
    setType(null);
    onClose();
  };

  return (
    <div
      onClick={handleClose}
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
          <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} color="rgba(255,255,255,0.6)" />
          </button>
        </div>

        {step === "select" ? (
          <>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,168,15,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <Wallet size={28} color="var(--accent)" />
            </div>
            <div>
              <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                Agregar Wallet
              </span>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                Demostración • Selecciona el tipo
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setType("crypto")}
                style={{
                  flex: 1, padding: "14px 10px", borderRadius: "12px", border: "1px solid",
                  borderColor: type === "crypto" ? "var(--accent)" : "rgba(255,255,255,0.08)",
                  background: type === "crypto" ? "rgba(255,168,15,0.08)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer", transition: "all 0.2s ease",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                }}
              >
                <Bitcoin size={24} color={type === "crypto" ? "var(--accent)" : "rgba(255,255,255,0.4)"} />
                <span className="dm-sans" style={{ color: type === "crypto" ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: type === "crypto" ? 600 : 400 }}>
                  Cripto
                </span>
              </button>
              <button
                onClick={() => setType("fiat")}
                style={{
                  flex: 1, padding: "14px 10px", borderRadius: "12px", border: "1px solid",
                  borderColor: type === "fiat" ? "var(--accent)" : "rgba(255,255,255,0.08)",
                  background: type === "fiat" ? "rgba(255,168,15,0.08)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer", transition: "all 0.2s ease",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                }}
              >
                <Banknote size={24} color={type === "fiat" ? "var(--accent)" : "rgba(255,255,255,0.4)"} />
                <span className="dm-sans" style={{ color: type === "fiat" ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: type === "fiat" ? 600 : 400 }}>
                  Fiat
                </span>
              </button>
            </div>

            <p className="dm-sans" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", lineHeight: "1.4", margin: 0 }}>
              Esta es una simulación demostrativa. No se creará ninguna wallet real.
            </p>

            <button onClick={handleAdd} disabled={!type}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", cursor: type ? "pointer" : "not-allowed", background: type ? "var(--accent)" : "rgba(255,255,255,0.06)", color: type ? "#000" : "rgba(255,255,255,0.25)", fontSize: "14px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease" }}>
              {type ? `Agregar wallet ${type === "crypto" ? "cripto" : "fiat"}` : "Selecciona un tipo"}
            </button>
          </>
        ) : (
          <>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <div>
              <span className="quantico" style={{ color: "#22c55e", fontSize: "18px", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                ¡Wallet agregada!
              </span>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                Demostración • Wallet {type === "crypto" ? "cripto" : "fiat"} simulada
              </span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Tipo</span>
                <span className="quantico" style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{type === "crypto" ? "Criptomoneda" : "Fiat"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Balance inicial</span>
                <span className="quantico" style={{ color: "var(--accent)", fontSize: "13px", fontWeight: 700 }}>$0.00</span>
              </div>
            </div>

            <button onClick={handleClose}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
              Entendido
            </button>
          </>
        )}
      </div>
    </div>
  );
}
