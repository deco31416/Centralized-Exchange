"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface AppSwapInputProps {
  label: string;
  symbol: string;
  color: string;
  amount: string;
  onAmountChange: (val: string) => void;
  readonly?: boolean;
}

const TOKEN_ICONS: Record<string, string> = {
  BTC: "/images/coins/bitcoin-btc-logo_vftsg2.svg",
  ETH: "/images/coins/ethereum-eth-logo_vgwnfh.svg",
  USDT: "/images/stablecoin/tether-usdt-logo_nwgfgy.svg",
  USDC: "/images/stablecoin/usdcoin-usdc-logo_rkqw1c.svg",
  SOL: "/images/coins/solana-sol-logo_igkjzk.svg",
  BNB: "/images/coins/binancecoin-bnb-logo_ohkihi.svg",
  XRP: "/images/coins/xrp-xrp-dark-logo_wl2vxs.svg",
  ADA: "/images/coins/cardano-ada-logo_wqdcwl.svg",
  TON: "/images/coins/toncoin-ton-logo_kp3fzb.svg",
  XLM: "/images/coins/stellar-xlm-dark-logo_pfkyun.svg",
  TRX: "/images/coins/tron-trx-logo_qia8hy.svg",
  AVAX: "/images/coins/avalanche-avax-logo_qsvy4u.svg",
  DOGE: "/images/coins/dogecoin-doge-logo_irw7os.svg",
  LTC: "/images/coins/litecoin-ltc-logo_xzaiai.svg",
  DOT: "/images/coins/polkadot-dot-logo_adc7sb.svg",
  LINK: "/images/altcoins/chainlink-link-logo_svmufx.svg",
  UNI: "/images/altcoins/uniswap-uni-logo_xvbylu.svg",
  WBTC: "/images/altcoins/wrappedbitcoin-wbtc-logo_oakxqe.svg",
  DAI: "/images/stablecoin/dai-dai-logo_irexm0.svg",
  COP: "/images/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg",
  USD: "/images/FiatAccepted/usa-us-usd-logo_lx28hi.svg",
  EUR: "/images/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg",
  MXN: "/images/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg",
};

/**
 * Campo de intercambio: token + amount.
 * Usado en pantalla Swap (You Send / You Receive).
 */
export default function AppSwapInput({
  label,
  symbol,
  color,
  amount,
  onAmountChange,
  readonly = false,
}: AppSwapInputProps) {
  const icon = TOKEN_ICONS[symbol.toUpperCase()];

  return (
    <div
      className="wallet-field-panel"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        padding: "14px 16px",
      }}
    >
      <span
        className="dm-sans"
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "11px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "6px",
        }}
      >
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          readOnly={readonly}
          onChange={(e) => onAmountChange(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "20px",
            fontWeight: 700,
            fontFamily: "'Quantico', sans-serif",
            width: "120px",
            outline: "none",
            caretColor: "var(--accent)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          {icon ? (
            <img
              src={icon}
              alt={symbol}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="quantico" style={{ color: "#fff", fontSize: "9px", fontWeight: 700 }}>
                {symbol.charAt(0)}
              </span>
            </div>
          )}
          <span
            className="quantico"
            style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}
          >
            {symbol}
          </span>
          <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
        </div>
      </div>
    </div>
  );
}
