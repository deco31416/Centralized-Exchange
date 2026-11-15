"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowLeft, Info } from "lucide-react";
import AppSwapInput from "./AppSwapInput";
import SwapSuccessModal from "./SwapSuccessModal";

interface AppSwapScreenProps {
  onBack?: () => void;
}

const MOCK_RATE = 0.000023;
const MOCK_SPREAD = 0.05;
const MOCK_FEE = 0.3;
const MOCK_NETWORK_FEE = 0.000006;
const MOCK_SLIPPAGE = 0.5;

function fmt(n: number, decimals = 8): string {
  return n.toFixed(decimals);
}

export default function AppSwapScreen({ onBack }: AppSwapScreenProps) {
  const [sendAmount, setSendAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const numSend = parseFloat(sendAmount) || 0;
  const hasAmount = numSend > 0;

  const rawReceive = numSend * MOCK_RATE;
  const feeAmount = rawReceive * (MOCK_FEE / 100);
  const spreadCost = rawReceive * (MOCK_SPREAD / 100);
  const netReceive = rawReceive - feeAmount - spreadCost - MOCK_NETWORK_FEE;

  const details = [
    { label: "Rate de mercado", value: `1 USDT = ${MOCK_RATE} BTC`, muted: false },
    { label: "Spread", value: `${MOCK_SPREAD}%`, muted: false },
    { label: "Comisión", value: `${MOCK_FEE}%`, muted: false },
    { label: "Slippage máx.", value: `${MOCK_SLIPPAGE}%`, muted: false },
  ];

  const calcRows = hasAmount
    ? [
        { label: "Recibes (bruto)", value: `${fmt(rawReceive)} BTC`, accent: false, highlight: false },
        { label: "Comisión", value: `-${fmt(feeAmount)} BTC`, accent: true, highlight: false },
        { label: "Spread", value: `-${fmt(spreadCost)} BTC`, accent: true, highlight: false },
        { label: "Network fee", value: `-${fmt(MOCK_NETWORK_FEE)} BTC`, accent: true, highlight: false },
        { label: "Recibes (neto)", value: `${fmt(Math.max(0, netReceive))} BTC`, accent: false, highlight: true },
      ]
    : [];

  return (
    <div
      className="wallet-action-screen"
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        background: "#080808",
        minHeight: "100%",
      }}
    >
      {/* Header with back button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
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
          style={{
            color: "#fff",
            fontSize: "18px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Swap
        </span>
      </div>

      {/* You Send */}
      <AppSwapInput
        label="Envías"
        symbol="USDT"
        color="#26a17b"
        amount={sendAmount}
        onAmountChange={setSendAmount}
      />

      {/* Arrow */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "-4px 0",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(255,168,15,0.12)",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "#080808",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowDown size={16} color="var(--accent)" />
        </div>
      </div>

      {/* You Receive */}
      <AppSwapInput
        label="Recibes"
        symbol="BTC"
        color="#f7931a"
        amount={hasAmount ? fmt(Math.max(0, netReceive), netReceive < 0.01 ? 8 : 6) : "0.00"}
        onAmountChange={() => {}}
        readonly
      />

      {/* Datos del mercado */}
      <div
        style={{
          background: "rgba(255,255,255,0.025)",
          borderRadius: "12px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.05)",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
          <Info size={12} color="var(--accent)" />
          <span className="dm-sans" style={{ color: "var(--accent)", fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>
            Datos del mercado
          </span>
        </div>
        {details.map((d) => (
          <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>
              {d.label}
            </span>
            <span className="quantico" style={{ color: d.muted ? "rgba(255,255,255,0.4)" : "#fff", fontSize: "11px", fontWeight: 600 }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>

      {/* Desglose del swap */}
      {hasAmount && (
        <div
          style={{
            background: "rgba(255,168,15,0.04)",
            borderRadius: "12px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(255,168,15,0.1)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span className="dm-sans" style={{ color: "var(--accent)", fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>
            Desglose de tu swap
          </span>
          {calcRows.map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: r.highlight ? "6px" : "0",
                borderTopWidth: r.highlight ? "1px" : "0",
                borderTopStyle: r.highlight ? "solid" : "none",
                borderTopColor: r.highlight ? "rgba(255,168,15,0.15)" : "transparent",
              }}
            >
              <span
                className="dm-sans"
                style={{
                  color: r.accent ? "#ef4444" : r.highlight ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: r.highlight ? "12px" : "11px",
                  fontWeight: r.highlight ? 700 : 400,
                }}
              >
                {r.label}
              </span>
              <span
                className="quantico"
                style={{
                  color: r.accent ? "#ef4444" : r.highlight ? "var(--accent)" : "#fff",
                  fontSize: r.highlight ? "14px" : "11px",
                  fontWeight: 700,
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Swap CTA */}
      <button
        disabled={!hasAmount}
        onClick={() => hasAmount && setShowSuccess(true)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          cursor: hasAmount ? "pointer" : "not-allowed",
          background: hasAmount ? "var(--accent)" : "rgba(255,255,255,0.06)",
          color: hasAmount ? "#000" : "rgba(255,255,255,0.25)",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "'Quantico', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          transition: "all 0.2s ease",
          marginTop: "2px",
        }}
      >
        {hasAmount ? "Confirmar Swap" : "Ingresa un monto"}
      </button>

      {hasAmount && (
        <p
          className="dm-sans"
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "9px",
            textAlign: "center",
            margin: "4px 0 0",
            lineHeight: "1.4",
          }}
        >
          Recibirás ≈{fmt(Math.max(0, netReceive), netReceive < 0.01 ? 8 : 6)} BTC después de comisiones y network fee.
          El slippage máximo es {MOCK_SLIPPAGE}%. Si el precio varía más del {MOCK_SLIPPAGE}%, la transacción se revertirá.
        </p>
      )}

      {/* Success Modal */}
      <SwapSuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        sendAmount={sendAmount}
        sendSymbol="USDT"
        receiveAmount={hasAmount ? fmt(Math.max(0, netReceive), netReceive < 0.01 ? 8 : 6) : "0.00"}
        receiveSymbol="BTC"
      />
    </div>
  );
}
