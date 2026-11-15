"use client";

import React from "react";
import { Home, ArrowLeftRight, Users, BarChart3, Wallet } from "lucide-react";

interface AppBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

/**
 * Barra de navegación inferior del mockup — exchange footer real.
 */
export default function AppBottomNav({ activeTab = "Swap", onTabChange }: AppBottomNavProps) {
  const tabs = [
    { id: "inicio", icon: Home, label: "Inicio" },
    { id: "p2p", icon: Users, label: "P2P" },
    { id: "swap", icon: ArrowLeftRight, label: "Swap" },
    { id: "mercados", icon: BarChart3, label: "Mercados" },
    { id: "fiat", icon: Wallet, label: "Fiat" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 4px 16px",
        background: "#0a0a0a",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        marginTop: "auto",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              cursor: "pointer",
              minWidth: "48px",
            }}
          >
            <Icon
              size={18}
              color={isActive ? "var(--accent)" : "rgba(255,255,255,0.35)"}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span
              className="dm-sans"
              style={{
                color: isActive ? "var(--accent)" : "rgba(255,255,255,0.35)",
                fontSize: "9px",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
