"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus, Wallet, Eye, EyeOff, ChevronDown } from "lucide-react";
import AddWalletModal from "./AddWalletModal";

interface AppWalletScreenProps {
  onBack?: () => void;
}

const CRYPTO_WALLETS = [
  { symbol: "BTC", name: "Bitcoin", balance: "0.42", usd: "$18,230", img: "/images/coins/bitcoin-btc-logo_vftsg2.svg" },
  { symbol: "ETH", name: "Ethereum", balance: "2.15", usd: "$6,880", img: "/images/coins/ethereum-eth-logo_vgwnfh.svg" },
  { symbol: "USDT", name: "Tether", balance: "3,500", usd: "$3,500", img: "/images/stablecoin/tether-usdt-logo_nwgfgy.svg" },
  { symbol: "SOL", name: "Solana", balance: "12.8", usd: "$1,920", img: "/images/coins/solana-sol-logo_igkjzk.svg" },
  { symbol: "XRP", name: "XRP", balance: "5,200", usd: "$2,860", img: "/images/coins/xrp-xrp-dark-logo_wl2vxs.svg" },
  { symbol: "ADA", name: "Cardano", balance: "8,400", usd: "$3,780", img: "/images/coins/cardano-ada-logo_wqdcwl.svg" },
];

const FIAT_WALLETS = [
  { symbol: "COP", name: "Peso Colombiano", balance: "12,450,000", usd: "$3,180", img: "/images/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg" },
  { symbol: "USD", name: "Dólar", balance: "5,200", usd: "$5,200", img: "/images/FiatAccepted/usa-us-usd-logo_lx28hi.svg" },
  { symbol: "EUR", name: "Euro", balance: "2,100", usd: "$2,310", img: "/images/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg" },
  { symbol: "MXN", name: "Peso Mexicano", balance: "48,000", usd: "$2,740", img: "/images/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg" },
];

/**
 * Pantalla Monedero — billeteras cripto + fiat separadas.
 */
export default function AppWalletScreen({ onBack }: AppWalletScreenProps) {
  const [showCrypto, setShowCrypto] = useState(false);
  const [showFiat, setShowFiat] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const wallets = showCrypto ? CRYPTO_WALLETS : [];
  const fiats = showFiat ? FIAT_WALLETS : [];
  const totalUSD = "$30,530.00";

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", background: "#080808", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <Wallet size={18} color="var(--accent)" />
        <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>Monedero</span>
      </div>

      {/* Total Balance */}
      <div style={{ background: "rgba(255,168,15,0.06)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,168,15,0.12)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", marginBottom: "4px" }} onClick={() => setShowBalance(!showBalance)}>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", textTransform: "uppercase" }}>Balance total</span>
          {showBalance ? <Eye size={14} color="rgba(255,255,255,0.4)" /> : <EyeOff size={14} color="rgba(255,255,255,0.4)" />}
        </div>
        <p className="quantico" style={{ color: "#fff", fontSize: "32px", fontWeight: 700, margin: "4px 0" }}>
          {showBalance ? totalUSD : "••••••••"}
        </p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button onClick={() => setShowAddModal(true)}
            style={{ padding: "8px 16px", borderRadius: "20px", border: "none", background: "var(--accent)", color: "#000", fontSize: "12px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
      </div>

      {/* ─── Cripto ─── */}
      <div>
        <button onClick={() => setShowCrypto(!showCrypto)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", width: "100%" }}>
          <span className="dm-sans" style={{ color: "var(--accent)", fontSize: "12px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Criptomonedas</span>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{CRYPTO_WALLETS.length} activos</span>
          <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ transform: showCrypto ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", marginLeft: "auto" }} />
        </button>
        {showCrypto && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {wallets.map((w) => (
              <div key={w.symbol}
                style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s ease", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,168,15,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={w.img} alt={w.symbol} style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
                  <div>
                    <span className="dm-sans" style={{ color: "#fff", fontSize: "13px", fontWeight: 600, display: "block" }}>{w.symbol}</span>
                    <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{w.name}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="quantico" style={{ color: "#fff", fontSize: "13px", fontWeight: 700, display: "block" }}>{w.usd}</span>
                  <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{w.balance} {w.symbol}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

      {/* ─── Fiat ─── */}
      <div>
        <button onClick={() => setShowFiat(!showFiat)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", width: "100%" }}>
          <span className="dm-sans" style={{ color: "#22c55e", fontSize: "12px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Fiat</span>
          <span className="dm-sans" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{FIAT_WALLETS.length} monedas</span>
          <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ transform: showFiat ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", marginLeft: "auto" }} />
        </button>
        {showFiat && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {fiats.map((f) => (
              <div key={f.symbol}
                style={{ background: "rgba(34,197,94,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(34,197,94,0.08)", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s ease", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.08)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={f.img} alt={f.symbol} style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
                  <div>
                    <span className="dm-sans" style={{ color: "#fff", fontSize: "13px", fontWeight: 600, display: "block" }}>{f.symbol}</span>
                    <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{f.name}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="quantico" style={{ color: "#22c55e", fontSize: "13px", fontWeight: 700, display: "block" }}>{f.usd}</span>
                  <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{f.balance} {f.symbol}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="dm-sans" style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", textAlign: "center", margin: 0 }}>
        Tus claves privadas están cifradas. Solo tú tienes acceso.
      </p>

      <AddWalletModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
