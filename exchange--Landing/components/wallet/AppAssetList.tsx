"use client";

import React from "react";

const ASSETS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: "0.42",
    usdValue: "$18,230",
    img: "/images/coins/bitcoin-btc-logo_vftsg2.svg",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: "2.15",
    usdValue: "$6,880",
    img: "/images/coins/ethereum-eth-logo_vgwnfh.svg",
  },
  {
    symbol: "USDT",
    name: "Tether",
    amount: "3,500",
    usdValue: "$3,500",
    img: "/images/stablecoin/tether-usdt-logo_nwgfgy.svg",
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: "12.8",
    usdValue: "$1,920",
    img: "/images/coins/solana-sol-logo_igkjzk.svg",
  },
];

export default function AppAssetList() {
  return (
    <div style={{ padding: "12px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span
          className="dm-sans"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "11px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Mis activos
        </span>
        <span
          className="dm-sans"
          style={{
            color: "var(--accent)",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Ver todos →
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ASSETS.map((asset) => (
          <div
            key={asset.symbol}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={asset.img}
                alt={asset.symbol}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "contain",
                  flex: "0 0 auto",
                }}
              />
              <div>
                <span
                  className="dm-sans"
                  style={{
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  {asset.symbol}
                </span>
                <span
                  className="dm-sans"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "10px",
                  }}
                >
                  {asset.name}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                className="quantico"
                style={{
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                {asset.usdValue}
              </span>
              <span
                className="dm-sans"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "10px",
                }}
              >
                {asset.amount} {asset.symbol}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
