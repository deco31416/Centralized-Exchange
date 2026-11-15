"use client";

import React from "react";

interface MobileMockupProps {
  children: React.ReactNode;
}

/**
 * Marco de teléfono móvil — simula un iPhone con notch y bordes redondeados.
 */
export default function MobileMockup({ children }: MobileMockupProps) {
  const frameStyle = {
    "--accent": "#ff6c02",
    position: "relative",
    width: "min(320px, calc(100vw - 48px))",
    minWidth: 0,
    aspectRatio: "320 / 650",
    background: "#111111",
    borderRadius: "48px",
    border: "3px solid #333333",
    boxShadow:
      "0 0 0 2px #1a1a1a, 0 0 0 5px #222222, 0 20px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)",
    overflow: "hidden",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    paddingTop: "52px",
    paddingBottom: "28px",
  } as React.CSSProperties;

  return (
    <div
      className="deco-wallet-mockup"
      style={frameStyle}
    >
      {/* Notch / Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100px",
          height: "28px",
          background: "#000",
          borderRadius: "18px",
          zIndex: 10,
        }}
      />

      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "32px",
          right: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 9,
        }}
      >
        <span
          className="dm-sans"
          style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}
        >
          9:41
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Signal bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "11px" }}>
            <div style={{ width: "2.5px", height: "4px", background: "#fff", borderRadius: "1px" }} />
            <div style={{ width: "2.5px", height: "6px", background: "#fff", borderRadius: "1px" }} />
            <div style={{ width: "2.5px", height: "8px", background: "#fff", borderRadius: "1px" }} />
            <div style={{ width: "2.5px", height: "11px", background: "#fff", borderRadius: "1px" }} />
          </div>
          {/* Battery */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "10px",
                background: "#fff",
                borderRadius: "2px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: "2px",
                  right: "5px",
                  bottom: "2px",
                  background: "#000",
                  borderRadius: "1px",
                }}
              />
            </div>
            <div
              style={{
                width: "3px",
                height: "5px",
                background: "#fff",
                borderRadius: "0 1px 1px 0",
              }}
            />
          </div>
        </div>
      </div>

      {/* Content area — overflow hidden aquí, el scroll lo maneja AppExchangeScreen */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>

      {/* Home indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "130px",
          height: "5px",
          background: "rgba(255,255,255,0.3)",
          borderRadius: "3px",
          zIndex: 10,
        }}
      />

      <style>{`
        .deco-wallet-mockup svg {
          color: var(--accent);
        }

        .deco-wallet-mockup button svg {
          stroke: var(--accent);
        }

        .mobile-mockup-screen::-webkit-scrollbar {
          width: var(--scrollbar-compact-size);
        }
        .mobile-mockup-screen::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
        }
        .mobile-mockup-screen::-webkit-scrollbar-thumb {
          border: 2px solid transparent;
          border-radius: 9999px;
          background: var(--scrollbar-thumb);
          background-clip: padding-box;
        }
        .mobile-mockup-screen::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}
