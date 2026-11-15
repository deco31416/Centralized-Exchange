"use client";

import React, { useState } from "react";
import { ArrowDownUp, Send, QrCode, MessageCirclePlus, Eye, EyeOff, Lock, Wallet, TrendingUp, CircleDollarSign } from "lucide-react";

interface AppExchangeHeaderProps {
  onSwapClick?: () => void;
  onSendClick?: () => void;
  onReceiveClick?: () => void;
  onBuyClick?: () => void;
  onSellClick?: () => void;
  onRemesasClick?: () => void;
  onWalletClick?: () => void;
  onLaunchpadClick?: () => void;
}

export default function AppExchangeHeader({ onSwapClick, onSendClick, onReceiveClick, onBuyClick, onSellClick, onRemesasClick, onWalletClick, onLaunchpadClick }: AppExchangeHeaderProps) {
  const [showBalance, setShowBalance] = useState(true);
  const BALANCE = "$12,458.50";
  const LOCKED = "$500.70";

  return (
    <div
      style={{
        padding: "16px 16px 12px",
        background: "#0a0a0a",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            onClick={() => setShowBalance(!showBalance)}
          >
            <span
              className="dm-sans"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Balance total
            </span>
            {showBalance ? (
              <Eye size={14} color="rgba(255,255,255,0.4)" />
            ) : (
              <EyeOff size={14} color="rgba(255,255,255,0.4)" />
            )}
          </div>
          <p
            className="quantico"
            style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: 700,
              margin: "2px 0 0",
              transition: "all 0.2s ease",
            }}
          >
            {showBalance ? BALANCE : "••••••••"}
          </p>
        </div>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="quantico"
            style={{ color: "#000", fontSize: "14px", fontWeight: 700 }}
          >
            DC
          </span>
        </div>
      </div>

      {/* Locked funds */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.12)",
          borderRadius: "8px",
          marginBottom: "14px",
        }}
      >
        <Lock size={11} color="#22c55e" />
        <span
          className="dm-sans"
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "10px",
          }}
        >
          Fondos bloqueados
        </span>
        <span
          className="quantico"
          style={{
            color: "#22c55e",
            fontSize: "11px",
            fontWeight: 700,
            marginLeft: "auto",
          }}
        >
          {showBalance ? LOCKED : "•••••"}
        </span>
      </div>

      {/* Quick actions — Row 1 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        {[
          { icon: ArrowDownUp, label: "Swap", action: "swap" },
          { icon: Send, label: "Enviar", action: "send" },
          { icon: QrCode, label: "Recibir", action: "receive" },
          { icon: MessageCirclePlus, label: "Comprar", action: "buy" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => {
                if (action.action === "swap") onSwapClick?.();
                if (action.action === "send") onSendClick?.();
                if (action.action === "receive") onReceiveClick?.();
                if (action.action === "buy") onBuyClick?.();
                if (action.action === "sell") onSellClick?.();
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                padding: "10px 4px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer",
              }}
            >
              <Icon size={16} color="var(--accent)" />
              <span
                className="dm-sans"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick actions — Row 2 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        {[
          { icon: CircleDollarSign, label: "Vender", action: "sell" },
          { icon: Send, label: "Remesas", action: "remesas" },
          { icon: Wallet, label: "Monedero", action: "wallet" },
          { icon: TrendingUp, label: "Launchpad", action: "launchpad" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => {
                if (action.action === "sell") onSellClick?.();
                if (action.action === "remesas") onRemesasClick?.();
                if (action.action === "wallet") onWalletClick?.();
                if (action.action === "launchpad") onLaunchpadClick?.();
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                padding: "10px 4px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer",
              }}
            >
              <Icon size={16} color="var(--accent)" />
              <span
                className="dm-sans"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
