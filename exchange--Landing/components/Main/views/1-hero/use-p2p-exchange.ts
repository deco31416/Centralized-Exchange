"use client";

import { useState, useEffect } from "react";
import type { CryptoPriceData } from "@/types/crypto-price-data";
import { getSwapAssets } from "@/services/SwapAssetsService";
import type { SwapAssetsRequest, SwapAssetsResponse } from "./types";

export function useP2pExchange(
  cryptoCurrencies: CryptoPriceData[],
  tradeType: string
) {
  const [p2pFromCurrency, setP2pFromCurrency] = useState("BTC");
  const [p2pToCurrency, setP2pToCurrency] = useState("COP");
  const [p2pFromAmount, setP2pFromAmount] = useState("0.034");
  const [p2pToAmount, setP2pToAmount] = useState("0");
  const [p2pRate, setP2pRate] = useState("0");
  const [p2pTradeType, setP2pTradeType] = useState<"BUY" | "SELL">("SELL");
  const [hasError, setHasError] = useState(false);

  const isCryptoCurrency = (code: string) =>
    cryptoCurrencies.some((c) => c.symbol === code);

  const handleP2pFromAmountChange = (value: string) => setP2pFromAmount(value);
  const handleP2pFromCurrencyChange = (value: string) =>
    setP2pFromCurrency(value);
  const handleP2pToCurrencyChange = (value: string) => setP2pToCurrency(value);
  const handleP2pTradeTypeChange = (type: "BUY" | "SELL") =>
    setP2pTradeType(type);

  const handleP2pSwapCurrencies = () => {
    setP2pFromCurrency(p2pToCurrency);
    setP2pToCurrency(p2pFromCurrency);
    setP2pFromAmount(p2pToAmount);
    setP2pToAmount(p2pFromAmount);
    setP2pTradeType(p2pTradeType === "BUY" ? "SELL" : "BUY");
  };

  // Guard: si la moneda crypto seleccionada ya no está en la lista filtrada,
  // resetear al primer asset válido disponible.
  useEffect(() => {
    if (!cryptoCurrencies.length) return;
    if (!cryptoCurrencies.some((c) => c.symbol === p2pFromCurrency)) {
      setP2pFromCurrency(cryptoCurrencies[0].symbol);
    }
  }, [cryptoCurrencies]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tradeType !== "p2p-trading") return;
    const amount = Number.parseFloat(p2pFromAmount);
    if (isNaN(amount) || amount <= 0 || !p2pFromCurrency || !p2pToCurrency) {
      setP2pToAmount("0");
      setP2pRate("0");
      return;
    }
    setHasError(false);

    const req: SwapAssetsRequest = {
      from: p2pFromCurrency,
      to: p2pToCurrency,
      amount,
      type: p2pTradeType,
    };

    getSwapAssets(req)
      .then((res: SwapAssetsResponse) => {
        if (res && typeof res.result === "number") {
          // BUY = usuario paga fiat, recibe crypto (8 decimales para "You Receive")
          // SELL = usuario vende crypto, recibe fiat (2 decimales)
          // Usar p2pTradeType en vez de isCryptoCurrency() para evitar
          // race condition cuando cryptoCurrencies aún no ha cargado.
          const decimals = p2pTradeType === "BUY" ? 8 : 2;
          // La tasa por unidad puede ser 3.62e-9 (fiat→crypto); toFixed(8) da "0.00000000".
          const rateDecs = p2pTradeType === "BUY" ? 12 : 4;
          setP2pToAmount(res.result.toFixed(decimals));
          setP2pRate((res.result / amount).toFixed(rateDecs));
        } else {
          setP2pToAmount("0");
          setP2pRate("0");
        }
      })
      .catch(() => {
        setP2pToAmount("0");
        setP2pRate("0");
        setHasError(true);
      });
  }, [p2pFromAmount, p2pFromCurrency, p2pToCurrency, p2pTradeType, tradeType]);

  return {
    p2pFromCurrency,
    p2pToCurrency,
    p2pFromAmount,
    p2pToAmount,
    p2pRate,
    p2pTradeType,
    hasError,
    handleP2pFromAmountChange,
    handleP2pFromCurrencyChange,
    handleP2pToCurrencyChange,
    handleP2pTradeTypeChange,
    handleP2pSwapCurrencies,
  };
}
