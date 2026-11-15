"use client";

import React, { useState } from "react";
import { ArrowLeft, BarChart3, Info, ChevronDown } from "lucide-react";
import AppSpotTrade from "./AppSpotTrade";
import AppFuturesTrade from "./AppFuturesTrade";
import TradeSuccessModal from "./TradeSuccessModal";

interface AppMarketScreenProps {
  onBack?: () => void;
}

type MarketTab = "spot" | "futures";

const SPOT_STATS = { price: "$43,210", change: "+2.4%", up: true, high: "$43,850", low: "$42,100", volume: "$1.2B" };
const FUTURES_STATS = { price: "$43,250", change: "+2.1%", up: true, fundingRate: "0.01%", nextFunding: "4h 23m", openInterest: "$2.1B" };

/**
 * Pantalla Mercado — TradingView + Spot/Futuros.
 */
export default function AppMarketScreen({ onBack }: AppMarketScreenProps) {
  const [tab, setTab] = useState<MarketTab>("spot");
  const [showTrade, setShowTrade] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTradeSuccess = () => setModalOpen(true);

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", background: "#080808", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <BarChart3 size={18} color="var(--accent)" />
        <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>Mercado</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)" }}>
        <button onClick={() => setTab("spot")}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", background: tab === "spot" ? "rgba(255,255,255,0.08)" : "transparent", color: tab === "spot" ? "#fff" : "rgba(255,255,255,0.35)", transition: "all 0.2s ease" }}>
          Spot
        </button>
        <button onClick={() => setTab("futures")}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", background: tab === "futures" ? "rgba(255,255,255,0.08)" : "transparent", color: tab === "futures" ? "#fff" : "rgba(255,255,255,0.35)", transition: "all 0.2s ease" }}>
          Futuros
        </button>
      </div>

      {/* TradingView Chart */}
      <div style={{ borderRadius: "12px", overflow: "hidden", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)", height: "220px", background: "#0a0a0a" }}>
        <iframe
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=BINANCE%3ABTCUSDT&interval=5&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&hide_legend=1&hide_side_toolbar=1&editable=false`}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="TradingView BTC/USDT"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Show/Hide Trading */}
      <button onClick={() => setShowTrade(!showTrade)}
        style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,168,15,0.2)", background: showTrade ? "rgba(255,168,15,0.06)" : "transparent", color: showTrade ? "var(--accent)" : "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s ease" }}>
        {showTrade ? "Ocultar trading" : "Operar"} <ChevronDown size={14} style={{ transform: showTrade ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
      </button>

      {/* Trading Panel */}
      {showTrade && (
        tab === "spot" ? (
          <AppSpotTrade onSuccess={handleTradeSuccess} />
        ) : (
          <AppFuturesTrade onSuccess={handleTradeSuccess} />
        )
      )}

      {/* Market Stats */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" }}>
          {tab === "spot" ? "BTC/USDT — Spot" : "BTCUSDT.P — Futuros"}
        </span>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="quantico" style={{ color: "#fff", fontSize: "22px", fontWeight: 700 }}>
            {tab === "spot" ? SPOT_STATS.price : FUTURES_STATS.price}
          </span>
          <span className="dm-sans" style={{ color: (tab === "spot" ? SPOT_STATS.up : FUTURES_STATS.up) ? "#22c55e" : "#ef4444", fontSize: "14px", fontWeight: 700 }}>
            {tab === "spot" ? SPOT_STATS.change : FUTURES_STATS.change}
          </span>
        </div>

        {tab === "spot" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "8px 10px" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", display: "block" }}>24h High</span>
              <span className="quantico" style={{ color: "#22c55e", fontSize: "12px", fontWeight: 700 }}>{SPOT_STATS.high}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "8px 10px" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", display: "block" }}>24h Low</span>
              <span className="quantico" style={{ color: "#ef4444", fontSize: "12px", fontWeight: 700 }}>{SPOT_STATS.low}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "8px 10px", gridColumn: "span 2" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", display: "block" }}>Vol 24h</span>
              <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{SPOT_STATS.volume}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "8px 10px" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", display: "block" }}>Funding Rate</span>
              <span className="quantico" style={{ color: "var(--accent)", fontSize: "12px", fontWeight: 700 }}>{FUTURES_STATS.fundingRate}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "8px 10px" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", display: "block" }}>Próximo pago</span>
              <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{FUTURES_STATS.nextFunding}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "8px 10px", gridColumn: "span 2" }}>
              <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", display: "block" }}>Interés Abierto</span>
              <span className="quantico" style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{FUTURES_STATS.openInterest}</span>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{ background: "rgba(255,168,15,0.05)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,168,15,0.1)", borderRadius: "12px", padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
        <Info size={12} color="var(--accent)" style={{ marginTop: "1px", flexShrink: 0 }} />
        <p className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", lineHeight: "1.4", margin: 0 }}>
          Modo demostrativo. TradingView muestra datos de mercado indicativos. No se ejecutan operaciones reales.
        </p>
      </div>

      <TradeSuccessModal open={modalOpen} onClose={() => setModalOpen(false)} side={tab === "spot" ? "Spot" : "Futuros"} />
    </div>
  );
}
