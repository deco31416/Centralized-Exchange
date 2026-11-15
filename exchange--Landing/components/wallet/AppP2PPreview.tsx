"use client";

import React from "react";
import { DollarSign } from "lucide-react";

const ORDERS = [
  { type: "buy", trader: "CarlosM", amount: "500 USDT", price: "$3,900 COP", completed: "98%" },
  { type: "sell", trader: "AnaP2P", amount: "200 USDT", price: "$3,950 COP", completed: "85%" },
  { type: "buy", trader: "LuisTrader", amount: "1,000 USDT", price: "$3,880 COP", completed: "100%" },
];

export default function AppP2PPreview() {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        <DollarSign size={14} color="var(--accent)" />
        <span
          className="dm-sans"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "11px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          P2P Activo
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ORDERS.map((order) => (
          <div
            key={order.trader}
            style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    background:
                      order.type === "buy"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                    color: order.type === "buy" ? "#22c55e" : "#ef4444",
                    textTransform: "uppercase",
                  }}
                >
                  {order.type === "buy" ? "Compra" : "Venta"}
                </span>
                <span
                  className="dm-sans"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "11px",
                  }}
                >
                  {order.trader}
                </span>
              </div>
              <span
                className="quantico"
                style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}
              >
                {order.price}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="dm-sans"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "10px",
                }}
              >
                {order.amount}
              </span>
              <div
                style={{
                  width: "80px",
                  height: "4px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: order.completed,
                    height: "100%",
                    background:
                      order.type === "buy" ? "#22c55e" : "#ef4444",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
