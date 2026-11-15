"use client";

import React, { useState, useCallback } from "react";
import AppExchangeHeader from "./AppExchangeHeader";
import AppAssetList from "./AppAssetList";
import AppMarketPreview from "./AppMarketPreview";
import AppP2PPreview from "./AppP2PPreview";
import AppSwapScreen from "./AppSwapScreen";
import AppSendScreen from "./AppSendScreen";
import AppReceiveScreen from "./AppReceiveScreen";
import AppBuyScreen from "./AppBuyScreen";
import AppSellScreen from "./AppSellScreen";
import AppRemesasScreen from "./AppRemesasScreen";
import AppWalletScreen from "./AppWalletScreen";
import AppLaunchpadScreen from "./AppLaunchpadScreen";
import AppP2PScreen from "./AppP2PScreen";
import AppMarketScreen from "./AppMarketScreen";
import AppFiatScreen from "./AppFiatScreen";
import AppBottomNav from "./AppBottomNav";

type Screen = "home" | "swap" | "send" | "receive" | "buy" | "sell" | "remesas" | "wallet" | "launchpad" | "p2p" | "market" | "fiat";

/**
 * Contenido según la pantalla activa (sin footer).
 */
function ScreenContent({ screen, goHome }: { screen: Screen; goHome: () => void }) {
  switch (screen) {
    case "swap":
      return <AppSwapScreen onBack={goHome} />;
    case "send":
      return <AppSendScreen onBack={goHome} />;
    case "receive":
      return <AppReceiveScreen onBack={goHome} />;
    case "buy":
      return <AppBuyScreen onBack={goHome} />;
    case "sell":
      return <AppSellScreen onBack={goHome} />;
    case "remesas":
      return <AppRemesasScreen onBack={goHome} />;
    case "wallet":
      return <AppWalletScreen onBack={goHome} />;
    case "launchpad":
      return <AppLaunchpadScreen onBack={goHome} />;
    case "p2p":
      return <AppP2PScreen onBack={goHome} />;
    case "market":
      return <AppMarketScreen onBack={goHome} />;
    case "fiat":
      return <AppFiatScreen onBack={goHome} />;
    default:
      return (
        <>
          <AppAssetList />
          <AppMarketPreview />
          <AppP2PPreview />
        </>
      );
  }
}

export default function AppExchangeScreen() {
  const [screen, setScreen] = useState<Screen>("home");

  const goToSwap = useCallback(() => setScreen("swap"), []);
  const goToSend = useCallback(() => setScreen("send"), []);
  const goToReceive = useCallback(() => setScreen("receive"), []);
  const goToBuy = useCallback(() => setScreen("buy"), []);
  const goToSell = useCallback(() => setScreen("sell"), []);
  const goToRemesas = useCallback(() => setScreen("remesas"), []);
  const goToWallet = useCallback(() => setScreen("wallet"), []);
  const goToLaunchpad = useCallback(() => setScreen("launchpad"), []);
  const goToP2P = useCallback(() => setScreen("p2p"), []);
  const goToMarket = useCallback(() => setScreen("market"), []);
  const goToFiat = useCallback(() => setScreen("fiat"), []);
  const goHome = useCallback(() => setScreen("home"), []);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === "swap") setScreen("swap");
    else if (tab === "p2p") setScreen("p2p");
    else if (tab === "mercados") setScreen("market");
    else if (tab === "fiat") setScreen("fiat");
    else if (tab === "inicio") setScreen("home");
  }, []);

  const showHeader = screen === "home";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#080808" }}>
      {/* Header fijo arriba */}
      {showHeader && (
        <div style={{ flexShrink: 0 }}>
          <AppExchangeHeader onSwapClick={goToSwap} onSendClick={goToSend} onReceiveClick={goToReceive} onBuyClick={goToBuy} onSellClick={goToSell} onRemesasClick={goToRemesas} onWalletClick={goToWallet} onLaunchpadClick={goToLaunchpad} />
        </div>
      )}

      {/* Contenido scrolleable: este es el único que hace scroll */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} className="app-exchange-scroll modal-scroll">
        <ScreenContent screen={screen} goHome={goHome} />
      </div>

      {/* Footer fijo abajo */}
      <div style={{ flexShrink: 0 }}>
        <AppBottomNav
          activeTab={screen === "swap" ? "swap" : screen === "p2p" ? "p2p" : screen === "market" ? "mercados" : screen === "fiat" ? "fiat" : "inicio"}
          onTabChange={handleTabChange}
        />
      </div>

      <style>{`
        .wallet-action-screen {
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.055), transparent 34%),
            linear-gradient(rgba(255,168,15,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,168,15,0.014) 1px, transparent 1px),
            #050607 !important;
          background-size: auto, 34px 34px, 34px 34px, auto !important;
        }

        .wallet-action-screen input,
        .wallet-action-screen textarea {
          color: #fff !important;
        }

        .wallet-action-screen input::placeholder,
        .wallet-action-screen textarea::placeholder {
          color: rgba(255,255,255,0.28) !important;
        }

        .wallet-action-screen > div[style*="rgba(255,255,255,0.03)"],
        .wallet-action-screen > div[style*="rgba(255,255,255,0.025)"],
        .wallet-action-screen > div[style*="rgba(255,168,15,0.04)"],
        .wallet-action-screen > div[style*="rgba(255,168,15,0.05)"],
        .wallet-field-panel,
        .wallet-list-card {
          position: relative !important;
          overflow: hidden !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.085), transparent 44%),
            linear-gradient(rgba(255,168,15,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,168,15,0.016) 1px, transparent 1px),
            #080a0d !important;
          background-size: auto, 34px 34px, 34px 34px, auto !important;
          box-shadow: 0 14px 32px rgba(0,0,0,0.32) !important;
        }

        .wallet-action-screen > div[style*="rgba(255,255,255,0.03)"]::before,
        .wallet-action-screen > div[style*="rgba(255,255,255,0.025)"]::before,
        .wallet-action-screen > div[style*="rgba(255,168,15,0.04)"]::before,
        .wallet-action-screen > div[style*="rgba(255,168,15,0.05)"]::before,
        .wallet-field-panel::before,
        .wallet-list-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .wallet-action-screen button {
          border-radius: 8px !important;
        }

        .wallet-action-screen button[style*="var(--accent)"],
        .wallet-action-screen button[style*="#ffa80f"] {
          box-shadow: 0 10px 24px rgba(255,168,15,0.16) !important;
        }

        .wallet-action-screen button[style*="rgba(255,255,255,0.06)"],
        .wallet-action-screen button[style*="rgba(255,255,255,0.04)"] {
          border: 1px solid rgba(255,255,255,0.08) !important;
          background: rgba(255,255,255,0.045) !important;
        }

        .wallet-action-screen span[style*="text-transform: uppercase"] {
          letter-spacing: 0.8px !important;
          color: rgba(255,255,255,0.52) !important;
        }

        .wallet-action-screen .quantico {
          letter-spacing: 0.3px;
        }

        .wallet-token-pill,
        .wallet-action-screen div[style*="border-radius: 20px"],
        .wallet-action-screen button[style*="border-radius: 20px"] {
          border-radius: 8px !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          background: rgba(255,255,255,0.045) !important;
        }

        .wallet-action-screen > div[style*="display: flex"][style*="gap: 4px"][style*="rgba(255,255,255,0.04)"] {
          border-radius: 8px !important;
          padding: 5px !important;
          background: rgba(255,255,255,0.035) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }

        .wallet-action-screen p {
          color: rgba(255,255,255,0.56) !important;
        }

        .app-exchange-scroll::-webkit-scrollbar {
          width: var(--scrollbar-compact-size);
        }
        .app-exchange-scroll::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
        }
        .app-exchange-scroll::-webkit-scrollbar-thumb {
          border: 2px solid transparent;
          border-radius: 9999px;
          background: var(--scrollbar-thumb);
          background-clip: padding-box;
        }
        .app-exchange-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}
