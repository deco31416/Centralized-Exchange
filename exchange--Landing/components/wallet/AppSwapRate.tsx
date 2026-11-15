"use client";

import React from "react";
import { Info } from "lucide-react";

interface AppSwapRateProps {
  rate: string;
  fee: string;
  networkFee: string;
}

/**
 * Muestra el rate de intercambio, fee y network fee.
 */
export default function AppSwapRate({ rate, fee, networkFee }: AppSwapRateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "10px 14px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
          Rate
        </span>
        <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>
          {rate}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
          Fee
        </span>
        <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>
          {fee}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
            Network Fee
          </span>
          <Info size={10} color="rgba(255,255,255,0.3)" />
        </div>
        <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>
          {networkFee}
        </span>
      </div>
    </div>
  );
}
