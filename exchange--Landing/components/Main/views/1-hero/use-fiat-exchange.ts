"use client";

import { useState, useEffect } from "react";
import { type Fiat, getFiatSwap } from "@/services/FiatService";

export function useFiatExchange(fiatCurrencies: Fiat[], tradeType: string) {
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("0");
  const [rate, setRate] = useState("0");
  const [fiatTradeType, setFiatTradeType] = useState<"BUY" | "SELL">("BUY");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("COP");
  const [hasError, setHasError] = useState(false);

  const handleFromAmountChange = (value: string) => setFromAmount(value);
  const handleFromCurrencyChange = (value: string) => setFromCurrency(value);
  const handleToCurrencyChange = (value: string) => setToCurrency(value);
  const handleFiatTradeTypeChange = (type: "BUY" | "SELL") =>
    setFiatTradeType(type);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFiatTradeType(fiatTradeType === "BUY" ? "SELL" : "BUY");
  };

  // Guard: si la lista filtrada ya no incluye la moneda seleccionada,
  // resetear al primer asset válido disponible. Nunca dejar selector vacío.
  useEffect(() => {
    if (!fiatCurrencies.length) return;
    if (!fiatCurrencies.some((f) => f.currency === fromCurrency)) {
      setFromCurrency(fiatCurrencies[0].currency);
    }
    if (!fiatCurrencies.some((f) => f.currency === toCurrency)) {
      const alt =
        fiatCurrencies.find((f) => f.currency !== fromCurrency) ??
        fiatCurrencies[0];
      setToCurrency(alt.currency);
    }
  }, [fiatCurrencies]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tradeType !== "fiat-exchange") return;
    const amount = Number.parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0 || !fromCurrency || !toCurrency) {
      setToAmount("0");
      setRate("0");
      return;
    }
    setHasError(false);

    getFiatSwap(fromCurrency, toCurrency, amount, fiatTradeType)
      .then((res: any) => {
        setToAmount(res.result.toFixed(2));
        setRate((res.result / amount).toFixed(4));
      })
      .catch(() => {
        setToAmount("0");
        setRate("0");
        setHasError(true);
      });
  }, [tradeType, fromCurrency, toCurrency, fromAmount, fiatTradeType]);

  return {
    fromAmount,
    toAmount,
    rate,
    fiatTradeType,
    fromCurrency,
    toCurrency,
    hasError,
    handleFromAmountChange,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleFiatTradeTypeChange,
    handleSwapCurrencies,
  };
}
