"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Fiat, getAvailableFiats } from "@/services/FiatService";
import { getCryptoCurrencies } from "@/services/CryptoService";
import type { CryptoPriceData } from "@/types/crypto-price-data";
import { PLACEHOLDER_IMAGE } from "./safe-image";
import { LOCAL_CURRENCY_ICONS, hasCurrencyIcon } from "./currency-icons";
import { FiatExchangeTab } from "./fiat-exchange-tab";
import { BuySellCryptoTab } from "./buy-sell-crypto-tab";
import { P2PTradingTab } from "./p2p-trading-tab";

export function HeroExchangeWidget() {
  const [fiatCurrencies, setFiatCurrencies] = useState<Fiat[]>([]);
  const [cryptoCurrencies, setCryptoCurrencies] = useState<CryptoPriceData[]>(
    []
  );
  const [tradeType, setTradeType] = useState("fiat-exchange");

  useEffect(() => {
    getAvailableFiats()
      .then((fiats) => setFiatCurrencies(fiats.filter((f) => hasCurrencyIcon(f.currency))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    getCryptoCurrencies(true)
      .then((cryptos) => setCryptoCurrencies(cryptos.filter((c) => hasCurrencyIcon(c.symbol))))
      .catch(console.error);
  }, []);

  const getCurrencyIcon = (code: string): string => {
    const crypto = cryptoCurrencies.find((c) => c.symbol === code);
    if (crypto?.imgUrl) return crypto.imgUrl;
    const fiat = fiatCurrencies.find((f) => f.currency === code);
    if (fiat?.imgUrl) return fiat.imgUrl;
    return LOCAL_CURRENCY_ICONS[code] ?? PLACEHOLDER_IMAGE;
  };

  const getCurrencyLabel = (code: string): string => {
    const crypto = cryptoCurrencies.find((c) => c.symbol === code);
    if (crypto) return `${crypto.name} (${crypto.symbol})`;
    const fiat = fiatCurrencies.find((f) => f.currency === code);
    if (fiat) return fiat.currency;
    return code;
  };

  return (
    <Card className="overflow-hidden rounded-[var(--radius)] border-border bg-card/95 font-heading shadow-[0_22px_70px_rgba(15,23,42,0.12),0_2px_10px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-card/90 dark:shadow-none">
      <Tabs
        defaultValue="fiat-exchange"
        value={tradeType}
        onValueChange={setTradeType}
        className="w-full"
      >
        <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-none border-b border-border/70 bg-muted/60 p-1.5 dark:border-border dark:bg-muted/20">
          <TabsTrigger
            value="fiat-exchange"
            className="rounded-[calc(var(--radius)-0.35rem)] border border-transparent py-3 font-heading data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none"
          >
            Cambia saldo
          </TabsTrigger>
          <TabsTrigger
            value="buy-sell-crypto"
            className="rounded-[calc(var(--radius)-0.35rem)] border border-transparent py-3 font-heading data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none"
          >
            Negocia cripto
          </TabsTrigger>
          <TabsTrigger
            value="p2p-trading"
            className="rounded-[calc(var(--radius)-0.35rem)] border border-transparent py-3 font-heading data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none"
          >
            P2P
          </TabsTrigger>
        </TabsList>

        <CardContent className="p-6">
          <FiatExchangeTab
            fiatCurrencies={fiatCurrencies}
            tradeType={tradeType}
            getCurrencyIcon={getCurrencyIcon}
          />
          <BuySellCryptoTab
            fiatCurrencies={fiatCurrencies}
            cryptoCurrencies={cryptoCurrencies}
            tradeType={tradeType}
            getCurrencyIcon={getCurrencyIcon}
            getCurrencyLabel={getCurrencyLabel}
          />
          <P2PTradingTab
            fiatCurrencies={fiatCurrencies}
            cryptoCurrencies={cryptoCurrencies}
            tradeType={tradeType}
            getCurrencyIcon={getCurrencyIcon}
            getCurrencyLabel={getCurrencyLabel}
          />
        </CardContent>
      </Tabs>
    </Card>
  );
}
