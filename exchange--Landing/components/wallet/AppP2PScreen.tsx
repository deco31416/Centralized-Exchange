"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, Star, Shield, TrendingUp } from "lucide-react";
import P2POrderModal from "./P2POrderModal";

interface AppP2PScreenProps {
  onBack?: () => void;
}

type P2POrderType = "buy" | "sell";

interface P2POrder {
  id: string;
  trader: string;
  rating: number;
  trades: number;
  type: P2POrderType;
  crypto: string;
  fiat: string;
  price: string;
  amount: string;
  methods: string[];
  verified: boolean;
}

const ORDERS: P2POrder[] = [
  {
    id: "1",
    trader: "CarlosM",
    rating: 4.9,
    trades: 342,
    type: "buy",
    crypto: "USDT",
    fiat: "COP",
    price: "$3,900",
    amount: "500 - 5,000 USDT",
    methods: ["Transferencia", "Efectivo"],
    verified: true,
  },
  {
    id: "2",
    trader: "AnaP2P",
    rating: 4.8,
    trades: 178,
    type: "sell",
    crypto: "USDT",
    fiat: "COP",
    price: "$3,950",
    amount: "100 - 2,000 USDT",
    methods: ["Tarjeta"],
    verified: true,
  },
  {
    id: "3",
    trader: "LuisTrader",
    rating: 4.7,
    trades: 523,
    type: "buy",
    crypto: "USDT",
    fiat: "COP",
    price: "$3,880",
    amount: "1,000 - 10,000 USDT",
    methods: ["Transferencia"],
    verified: false,
  },
  {
    id: "4",
    trader: "MariaCrypto",
    rating: 5.0,
    trades: 89,
    type: "sell",
    crypto: "USDT",
    fiat: "COP",
    price: "$3,970",
    amount: "50 - 500 USDT",
    methods: ["Transferencia", "Efectivo"],
    verified: true,
  },
  {
    id: "5",
    trader: "DiegoFx",
    rating: 4.6,
    trades: 215,
    type: "buy",
    crypto: "USDT",
    fiat: "COP",
    price: "$3,850",
    amount: "200 - 3,000 USDT",
    methods: ["Efectivo"],
    verified: true,
  },
];

/**
 * Pantalla P2P — mercado peer-to-peer.
 */
export default function AppP2PScreen({ onBack }: AppP2PScreenProps) {
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null);

  const handleOrder = (order: P2POrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const filteredOrders = filter === "all" ? ORDERS : ORDERS.filter((o) => o.type === filter);

  return (
    <div className="wallet-action-screen" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", background: "#080808", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <TrendingUp size={18} color="var(--accent)" />
        <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>Mercado P2P</span>
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Search size={14} color="rgba(255,255,255,0.3)" />
          <input placeholder="Buscar trader..." style={{ background: "transparent", border: "none", color: "#fff", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none", flex: 1, caretColor: "var(--accent)" }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)" }}>
        {[
          { id: "all", label: "Todos" },
          { id: "buy", label: "Comprar" },
          { id: "sell", label: "Vender" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id as typeof filter)}
            style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.3px", background: filter === f.id ? "rgba(255,255,255,0.08)" : "transparent", color: filter === f.id ? "#fff" : "rgba(255,255,255,0.35)", transition: "all 0.2s ease" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", paddingLeft: "4px" }}>{filteredOrders.length} órdenes activas</span>
        {filteredOrders.map((order) => (
          <div key={order.id}
            className="wallet-list-card"
            style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", transition: "border-color 0.2s ease", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,168,15,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>

            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: order.type === "buy" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="quantico" style={{ color: order.type === "buy" ? "#22c55e" : "#ef4444", fontSize: "12px", fontWeight: 700 }}>{order.trader.charAt(0)}</span>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="dm-sans" style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>{order.trader}</span>
                    {order.verified && <Shield size={12} color="var(--accent)" />}
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <Star size={11} color="#ffd200" fill="#ffd200" />
                      <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>{order.rating}</span>
                    </div>
                  </div>
                  <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{order.trades} trades</span>
                </div>
              </div>
              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", background: order.type === "buy" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: order.type === "buy" ? "#22c55e" : "#ef4444" }}>
                {order.type === "buy" ? "Compra" : "Venta"}
              </span>
            </div>

            {/* Price + amount */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>{order.price}</span>
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginLeft: "4px" }}>{order.fiat}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", display: "block" }}>{order.amount}</span>
              </div>
            </div>

            {/* Methods */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {order.methods.map((m) => (
                  <span key={m} style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "9px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>{m}</span>
                ))}
              </div>
              <button onClick={() => handleOrder(order)}
                style={{ padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer", background: order.type === "buy" ? "#22c55e" : "#ef4444", color: "#000", fontSize: "11px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
                {order.type === "buy" ? "Vender" : "Comprar"} USDT
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="dm-sans" style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", textAlign: "center", margin: 0 }}>
        Modo demostrativo. Las órdenes son simulaciones del mercado P2P.
      </p>

      <P2POrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trader={selectedOrder?.trader || ""}
        type={selectedOrder?.type || "buy"}
        price={selectedOrder?.price || ""}
        fiat={selectedOrder?.fiat || ""}
        amount={selectedOrder?.amount || ""}
      />
    </div>
  );
}
