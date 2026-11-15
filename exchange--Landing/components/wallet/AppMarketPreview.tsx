"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

const PAIRS = [
  { from: "BTC", to: "USDT", price: "$43,210", change: "+2.4%", up: true },
  { from: "ETH", to: "USDT", price: "$3,200", change: "-1.2%", up: false },
  { from: "SOL", to: "USDT", price: "$150.30", change: "+5.7%", up: true },
  { from: "USDT", to: "COP", price: "$3,910", change: "+0.3%", up: true },
];

const ICONS: Record<string, string> = {
  BTC: "/images/coins/bitcoin-btc-logo_vftsg2.svg",
  ETH: "/images/coins/ethereum-eth-logo_vgwnfh.svg",
  SOL: "/images/coins/solana-sol-logo_igkjzk.svg",
  USDT: "/images/stablecoin/tether-usdt-logo_nwgfgy.svg",
  COP: "/images/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg",
};

export default function AppMarketPreview() {
  return (
    <div style={{ padding: "12px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        <TrendingUp size={14} color="var(--accent)" />
        <span
          className="dm-sans"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "11px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Mercado
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {PAIRS.map((pair) => (
          <div
            key={pair.from + pair.to}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", width: "34px", flex: "0 0 auto" }}>
                <img
                  src={ICONS[pair.from]}
                  alt={pair.from}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    objectFit: "contain",
                    zIndex: 2,
                  }}
                />
                <img
                  src={ICONS[pair.to]}
                  alt={pair.to}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    objectFit: "contain",
                    marginLeft: "-6px",
                    background: "#101010",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>
              <span
                className="quantico"
                style={{
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {pair.from}/{pair.to}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                className="quantico"
                style={{
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                {pair.price}
              </span>
              <span
                className="dm-sans"
                style={{
                  color: pair.up ? "#22c55e" : "#ef4444",
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                {pair.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
