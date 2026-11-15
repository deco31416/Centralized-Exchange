"use client";

import React, { useState } from "react";
import { ArrowLeft, Rocket, Clock, Users, BarChart3, Info } from "lucide-react";
import LaunchpadSuccessModal from "./LaunchpadSuccessModal";

interface AppLaunchpadScreenProps {
  onBack?: () => void;
}

const LAUNCHES = [
  {
    id: "deco",
    name: "DecoToken",
    symbol: "DCO",
    img: "/images/altcoins/deco31416-decot-logo.svg",
    price: "$0.15",
    allocation: "$200,000",
    progress: 68,
    timeLeft: "2 días",
    participants: 342,
    description: "Token nativo del ecosistema Deco Exchange. Gobernanza y fee sharing.",
    color: "#ffa80f",
  },
  {
    id: "deco-pay",
    name: "DecoPay",
    symbol: "DCP",
    img: "/images/altcoins/deco31416-decot-logo.svg",
    price: "$0.20",
    allocation: "$500,000",
    progress: 42,
    timeLeft: "5 días",
    participants: 521,
    description: "Token de utilidad para pagos, comercios y beneficios dentro del ecosistema DECO.",
    color: "#ff6c02",
  },
  {
    id: "decox",
    name: "DecoX",
    symbol: "DECOX",
    img: "/images/altcoins/deco31416-decot-logo.svg",
    price: "$0.45",
    allocation: "$150,000",
    progress: 23,
    timeLeft: "8 días",
    participants: 189,
    description: "Token de liquidez y staking del ecosistema Deco.",
    color: "#ff6c02",
  },
  {
    id: "31416",
    name: "Deco31416 Token",
    symbol: "31416",
    img: "/images/altcoins/deco31416-decot-logo.svg",
    price: "$0.08",
    allocation: "$75,000",
    progress: 91,
    timeLeft: "12 horas",
    participants: 890,
    description: "Token de acceso anticipado con beneficios exclusivos en el ecosistema.",
    color: "#9effeb",
  },
];

/**
 * Pantalla Launchpad — lanzamiento de tokens.
 */
export default function AppLaunchpadScreen({ onBack }: AppLaunchpadScreenProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLaunch, setSelectedLaunch] = useState<typeof LAUNCHES[0] | null>(null);

  const handleParticipate = (launch: typeof LAUNCHES[0]) => {
    setSelectedLaunch(launch);
    setModalOpen(true);
  };

  return (
    <div className="wallet-action-screen" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", background: "#080808", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
        )}
        <Rocket size={18} color="var(--accent)" />
        <span className="quantico" style={{ color: "#fff", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>Launchpad</span>
      </div>

      {/* Info banner */}
      <div style={{ background: "rgba(255,168,15,0.05)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,168,15,0.1)", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <Info size={14} color="var(--accent)" style={{ marginTop: "1px", flexShrink: 0 }} />
        <p className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", lineHeight: "1.5", margin: 0 }}>
          Participa en lanzamientos de tokens nuevos. Invierte temprano y obtén tokens a precio preferencial antes de que salgan al mercado.
        </p>
      </div>

      {/* Launch list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span className="dm-sans" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", paddingLeft: "4px" }}>Próximos lanzamientos</span>
        {LAUNCHES.map((launch) => (
          <div key={launch.id}
            className="wallet-list-card"
            style={{ background: "rgba(255,255,255,0.03)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", transition: "border-color 0.2s ease", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = launch.color + "40"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>

            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: launch.color + "14", display: "flex", alignItems: "center", justifyContent: "center", borderWidth: "1px", borderStyle: "solid", borderColor: launch.color + "40", overflow: "hidden" }}>
                  {launch.img ? (
                    <img
                      src={launch.img}
                      alt={launch.symbol}
                      style={{ width: "24px", height: "24px", objectFit: "contain" }}
                    />
                  ) : (
                    <span className="quantico" style={{ color: launch.color, fontSize: "12px", fontWeight: 700 }}>{launch.symbol.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <span className="dm-sans" style={{ color: "#fff", fontSize: "14px", fontWeight: 600, display: "block" }}>{launch.name}</span>
                  <span className="quantico" style={{ color: launch.color, fontSize: "11px", fontWeight: 700 }}>{launch.symbol}</span>
                </div>
              </div>
              <span className="quantico" style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>{launch.price}</span>
            </div>

            {/* Description */}
            <p className="dm-sans" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", lineHeight: "1.5", margin: 0 }}>{launch.description}</p>

            {/* Stats */}
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <BarChart3 size={12} color="rgba(255,255,255,0.35)" />
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>{launch.allocation}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} color="rgba(255,255,255,0.35)" />
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>{launch.timeLeft}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Users size={12} color="rgba(255,255,255,0.35)" />
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>{launch.participants} participantes</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span className="dm-sans" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>Progreso</span>
                <span className="quantico" style={{ color: launch.color, fontSize: "11px", fontWeight: 700 }}>{launch.progress}%</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: launch.progress + "%", height: "100%", background: launch.color, borderRadius: "3px", transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* CTA */}
            <button onClick={() => handleParticipate(launch)}
              style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid " + launch.color + "40", background: launch.color + "10", color: launch.color, fontSize: "13px", fontWeight: 700, fontFamily: "'Quantico', sans-serif", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease", letterSpacing: "0.5px" }}>
              Participar
            </button>
          </div>
        ))}
      </div>

      <p className="dm-sans" style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", textAlign: "center", margin: 0 }}>
        Modo demostrativo. Los lanzamientos son simulaciones. No se realiza ninguna inversión real.
      </p>

      <LaunchpadSuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tokenName={selectedLaunch?.name || ""}
        tokenSymbol={selectedLaunch?.symbol || ""}
        price={selectedLaunch?.price || ""}
      />
    </div>
  );
}
