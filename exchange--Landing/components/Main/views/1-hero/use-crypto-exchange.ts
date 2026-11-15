"use client";

import { useState, useEffect } from "react";
import { type Fiat } from "@/services/FiatService";
import type { CryptoPriceData } from "@/types/crypto-price-data";
import { getSwapAssets } from "@/services/SwapAssetsService";
import type { SwapAssetsRequest, SwapAssetsResponse } from "./types";

export function useCryptoExchange(
  fiatCurrencies: Fiat[],
  cryptoCurrencies: CryptoPriceData[],
  tradeType: string
) {
  const [fromCryptoCurrency, setFromCryptoCurrency] = useState("COP");
  const [toCryptoCurrency, setToCryptoCurrency] = useState("BTC");
  const [cryptoFromAmount, setCryptoFromAmount] = useState("1000");
  const [cryptoToAmount, setCryptoToAmount] = useState("0");
  const [cryptoRate, setCryptoRate] = useState("0");
  const [cryptoTradeType, setCryptoTradeType] = useState<"BUY" | "SELL">("BUY");
  const [hasError, setHasError] = useState(false);

  const isCryptoCurrency = (code: string) =>
    cryptoCurrencies.some((c) => c.symbol === code);
  const isFiatCurrency = (code: string) =>
    fiatCurrencies.some((f) => f.currency === code);

  const handleCryptoFromAmountChange = (value: string) =>
    setCryptoFromAmount(value);
  const handleCryptoFromCurrencyChange = (value: string) =>
    setFromCryptoCurrency(value);
  const handleCryptoToCurrencyChange = (value: string) =>
    setToCryptoCurrency(value);

  const handleCryptoTradeTypeChange = (type: "BUY" | "SELL") => {
    setCryptoTradeType(type);
    if (type === "BUY") {
      if (isCryptoCurrency(fromCryptoCurrency)) {
        const temp = fromCryptoCurrency;
        setFromCryptoCurrency(toCryptoCurrency);
        setToCryptoCurrency(temp);
      }
    } else {
      if (isFiatCurrency(fromCryptoCurrency)) {
        const temp = fromCryptoCurrency;
        setFromCryptoCurrency(toCryptoCurrency);
        setToCryptoCurrency(temp);
      }
    }
  };

  const handleCryptoSwapCurrencies = () => {
    setFromCryptoCurrency(toCryptoCurrency);
    setToCryptoCurrency(fromCryptoCurrency);
    setCryptoFromAmount(cryptoToAmount);
    setCryptoToAmount(cryptoFromAmount);
    setCryptoTradeType(cryptoTradeType === "BUY" ? "SELL" : "BUY");
  };

  // Guard: si alguna moneda seleccionada ya no está en las listas filtradas,
  // resetear al primer asset válido. Nunca dejar selector vacío.
  useEffect(() => {
    if (!fiatCurrencies.length || !cryptoCurrencies.length) return;
    const fiatCodes = fiatCurrencies.map((f) => f.currency);
    const cryptoCodes = cryptoCurrencies.map((c) => c.symbol);
    if (!fiatCodes.includes(fromCryptoCurrency) && !cryptoCodes.includes(fromCryptoCurrency)) {
      setFromCryptoCurrency(fiatCurrencies[0].currency);
    }
    if (!fiatCodes.includes(toCryptoCurrency) && !cryptoCodes.includes(toCryptoCurrency)) {
      setToCryptoCurrency(cryptoCurrencies[0].symbol);
    }
  }, [fiatCurrencies, cryptoCurrencies]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tradeType !== "buy-sell-crypto") return;
    const amount = Number.parseFloat(cryptoFromAmount);
    if (
      isNaN(amount) ||
      amount <= 0 ||
      !fromCryptoCurrency ||
      !toCryptoCurrency
    ) {
      setCryptoToAmount("0");
      setCryptoRate("0");
      return;
    }
    setHasError(false);

    const req: SwapAssetsRequest = {
      from: fromCryptoCurrency,
      to: toCryptoCurrency,
      amount,
      type: cryptoTradeType,
    };

    getSwapAssets(req)
      .then((res: SwapAssetsResponse) => {
        if (res && typeof res.result === "number") {
          // BUY = usuario paga fiat, recibe crypto (8 decimales para "You Receive")
          // SELL = usuario paga crypto, recibe fiat (2 decimales)
          // Usar cryptoTradeType en vez de isCryptoCurrency() para evitar
          // race condition cuando cryptoCurrencies aún no ha cargado.
          const decimals = cryptoTradeType === "BUY" ? 8 : 2;
          // La tasa por unidad (ej. 1 COP = 3.62e-9 BTC) requiere más dígitos
          // que los 8 usados para "You Receive". Sin esto, toFixed(8) da "0.00000000".
          const rateDecs = cryptoTradeType === "BUY" ? 12 : 4;
          setCryptoToAmount(res.result.toFixed(decimals));
          setCryptoRate((res.result / amount).toFixed(rateDecs));
        } else {
          setCryptoToAmount("0");
          setCryptoRate("0");
        }
      })
      .catch(() => {
        setCryptoToAmount("0");
        setCryptoRate("0");
        setHasError(true);
      });
  }, [
    cryptoFromAmount,
    fromCryptoCurrency,
    toCryptoCurrency,
    cryptoTradeType,
    tradeType,
  ]);

  return {
    fromCryptoCurrency,
    toCryptoCurrency,
    cryptoFromAmount,
    cryptoToAmount,
    cryptoRate,
    cryptoTradeType,
    hasError,
    handleCryptoFromAmountChange,
    handleCryptoFromCurrencyChange,
    handleCryptoToCurrencyChange,
    handleCryptoTradeTypeChange,
    handleCryptoSwapCurrencies,
  };
}
